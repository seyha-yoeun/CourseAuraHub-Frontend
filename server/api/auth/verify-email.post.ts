import type { BackendAuthData } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; code: string }>(event)

  const data = await backendRequest<BackendAuthData>(event, '/auth/verify-email', {
    method: 'POST',
    body: {
      email: body?.email,
      code: body?.code,
    },
    auth: false,
    retryOn401: false,
    fallbackMessage: 'Email verification failed',
  })

  setSessionCookies(event, data, false)
  await ensureCsrfToken(event).catch(() => null)

  return toAuthUser(data)
})
