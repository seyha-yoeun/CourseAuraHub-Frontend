<<<<<<< HEAD
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
=======
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  const apiBase = config.public.apiBase || 'http://localhost:8080/api/v1'
  
  try {
    const response = await $fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getCSRFHeaders(event)
      }
    })
    
    setAuthCookies(event, response)
    return response
  } catch (error: unknown) {
    throw createError({
      statusCode: (error as { response?: { status: number } }).response?.status || 401,
      statusMessage: (error as { response?: { _data?: { message: string } } }).response?._data?.message || 'Login failed'
    })
  }
})

function getCSRFHeaders(event: ReturnType<typeof defineEventHandler>) {
  const cookies = parseCookies(event)
  const xsrfToken = cookies['XSRF-TOKEN']
  return xsrfToken ? { 'X-CSRF-TOKEN': xsrfToken } : {}
}

function setAuthCookies(event: ReturnType<typeof defineEventHandler>, response: { data?: { accessToken?: string; refreshToken?: string } }) {
  if (response.data?.accessToken) {
    setCookie(event, 'access_token', response.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15 // 15 minutes
    })
  }
  if (response.data?.refreshToken) {
    setCookie(event, 'refresh_token', response.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
  }
}
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
