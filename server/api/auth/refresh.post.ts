export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8080/api/v1'
  
  const cookies = parseCookies(event)
  const refreshToken = cookies['refresh_token']
  const xsrfToken = cookies['XSRF-TOKEN']
  
  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' })
  }
  
  try {
    const response = await $fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': xsrfToken || '',
        Cookie: `refresh_token=${refreshToken}`
      }
    })
    
    // Set new auth cookies from response
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
    
    return response
  } catch (error: unknown) {
    // Clear cookies on refresh failure
    deleteCookie(event, 'access_token', { path: '/' })
    deleteCookie(event, 'refresh_token', { path: '/' })
    deleteCookie(event, 'XSRF-TOKEN', { path: '/' })
    
    throw createError({
      statusCode: (error as { response?: { status: number } }).response?.status || 401,
      statusMessage: (error as { response?: { _data?: { message: string } } }).response?._data?.message || 'Session expired'
    })
  }
})