import type { BackendAuthData } from '../../../../utils/apiClient'

/**
 * Completes a two-factor sign-in for both password and OAuth2 logins.
 *
 * Lives under `/api/v1/auth/mfa` because the `mfa_challenge` cookie is scoped to that path:
 * the backend sets it there after OAuth2, and the login route sets the same cookie for password
 * sign-ins. The browser does not send it to any other path.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string; recoveryCode?: string }>(event)
  const mfaToken = getMfaChallengeCookie(event)

  if (!mfaToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Sign-in request expired',
      data: {
        code: 'MFA_CHALLENGE_EXPIRED',
        message: 'Your sign-in request has expired. Please sign in again.',
      },
    })
  }

  let data: BackendAuthData

  try {
    data = await backendRequest<BackendAuthData>(event, '/auth/mfa/verify', {
      method: 'POST',
      body: {
        mfaToken,
        code: body?.code?.trim() || undefined,
        recoveryCode: body?.recoveryCode?.trim() || undefined,
      },
      auth: false,
      retryOn401: false,
      fallbackMessage: 'Two-factor verification failed',
    })
  } catch (error) {
    const candidate = error as { data?: { code?: string; message?: unknown } }
    const message = candidate?.data?.message

    // The challenge is used up (expired, too many attempts or already consumed): start over.
    if (candidate?.data && typeof message === 'string' && message.startsWith('Invalid or expired two-factor challenge')) {
      clearMfaChallengeCookie(event)
      candidate.data.code = 'MFA_CHALLENGE_EXPIRED'
      candidate.data.message = 'Your sign-in request has expired. Please sign in again.'
    }

    throw error
  }

  clearMfaChallengeCookie(event)
  setSessionCookies(event, data)
  await ensureCsrfToken(event).catch(() => null)

  return toAuthUser(data)
})
