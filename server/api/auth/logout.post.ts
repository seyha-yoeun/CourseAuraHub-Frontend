export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8080/api/v1'
  
  try {
    const cookies = parseCookies(event)
    const refreshToken = cookies['refresh_token']
    
    await $fetch(`${apiBase}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': cookies['XSRF-TOKEN'] || '',
        Cookie: `refresh_token=${refreshToken}`
      }
    })
  } catch {
    // Ignore backend logout errors
  }
  
  // Always clear cookies on frontend
  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })
  deleteCookie(event, 'XSRF-TOKEN', { path: '/' })
  
  return { success: true, message: 'Logged out successfully' }
})