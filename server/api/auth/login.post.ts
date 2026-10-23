import type { BackendAuthData } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email: string
    password: string
    rememberMe?: boolean
  }>(event)

  const rememberMe = Boolean(body?.rememberMe)

  const data = await backendRequest<BackendAuthData>(event, '/auth/login', {
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

  setSessionCookies(event, data, rememberMe)
  await ensureCsrfToken(event).catch(() => null)

  return toAuthUser(data)
})
