export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8080/api/v1'
  
  const cookies = parseCookies(event)
  const accessToken = cookies['access_token']
  
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  
  try {
    const response = await $fetch(`${apiBase}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response
  } catch (error: unknown) {
    const status = (error as { response?: { status: number } }).response?.status || 401
    if (status === 401) {
      // Try to refresh token using our Nuxt API endpoint
      try {
        await $fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': cookies['XSRF-TOKEN'] || '',
            Cookie: `refresh_token=${cookies['refresh_token']}`
          }
        })
        // Retry me after refresh - need to get new access token
        const newCookies = parseCookies(event)
        const newAccessToken = newCookies['access_token']
        
        const retryResponse = await $fetch(`${apiBase}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${newAccessToken || accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        return retryResponse
      } catch {
        throw createError({ statusCode: 401, statusMessage: 'Session expired' })
      }
    }
    throw createError({ statusCode: status, statusMessage: 'Failed to get user' })
  }
})