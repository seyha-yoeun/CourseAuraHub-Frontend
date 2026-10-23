import type { BackendAuthData } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    firstName: string
    lastName: string
    email: string
    password: string
  }>(event)

  const data = await backendRequest<BackendAuthData>(event, '/auth/register', {
    method: 'POST',
    body,
    auth: false,
    retryOn401: false,
    fallbackMessage: 'Registration failed',
  })

  setSessionCookies(event, data, false)
  await ensureCsrfToken(event).catch(() => null)

  return toAuthUser(data)
})
