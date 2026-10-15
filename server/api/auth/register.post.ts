export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  const apiBase = config.public.apiBase || 'http://localhost:8080/api/v1'
  
  try {
    const response = await $fetch(`${apiBase}/auth/register`, {
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
      statusCode: (error as { response?: { status: number } }).response?.status || 400,
      statusMessage: (error as { response?: { _data?: { message: string } } }).response?._data?.message || 'Registration failed'
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
      maxAge: 60 * 15
    })
  }
  if (response.data?.refreshToken) {
    setCookie(event, 'refresh_token', response.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    })
  }
}