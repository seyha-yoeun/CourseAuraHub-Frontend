import type { BackendAuthData, BackendMfaChallenge } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email: string
    password: string
    rememberMe?: boolean
  }>(event)

  const rememberMe = Boolean(body?.rememberMe)

  let data: BackendAuthData | BackendMfaChallenge

  try {
    data = await backendRequest<BackendAuthData | BackendMfaChallenge>(event, '/auth/login', {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        rememberMe,
      },
      auth: false,
      retryOn401: false,
      fallbackMessage: 'Login failed',
    })
  } catch (error) {
    throw tagAccountStateError(error)
  }

  if (isMfaChallenge(data)) {
    // The challenge token stays in an HttpOnly cookie; the browser only learns that a code is needed.
    setMfaChallengeCookie(event, data)

    return {
      mfaRequired: true,
      methods: data.methods,
      expiresInSeconds: data.expiresInSeconds,
    }
  }

  setSessionCookies(event, data, rememberMe)
  await ensureCsrfToken(event).catch(() => null)

  return toAuthUser(data)
})
