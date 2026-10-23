<<<<<<< HEAD
export default defineEventHandler((event) => {
  const provider = getRouterParam(event, 'provider')
  const validProviders = ['google', 'github', 'facebook']

  if (!provider || !validProviders.includes(provider)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth2 provider' })
  }

  const backendOrigin = getBackendOrigin()
  return sendRedirect(event, `${backendOrigin}/api/v1/auth/oauth2/authorization/${provider}`, 302)
})
=======
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8080/api/v1'
  const provider = getRouterParam(event, 'provider')
  
  const validProviders = ['google', 'github', 'facebook']
  if (!validProviders.includes(provider)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid provider' })
  }
  
  // Get redirect_uri from query or use default
  const query = getQuery(event)
  const redirectUri = query.redirect_uri as string || `${config.public.siteUrl || 'http://localhost:3000'}/auth/callback`
  
  try {
    const response = await $fetch.raw(`${apiBase}/auth/oauth2/authorization/${provider}`, {
      method: 'GET',
      query: { redirect_uri: redirectUri },
      redirect: 'manual'
    })
    
    const location = response.headers.get('location')
    if (location) {
      return sendRedirect(event, location, 302)
    }
    
    throw createError({ statusCode: 500, statusMessage: 'No redirect URL from provider' })
  } catch (error: unknown) {
    if ((error as { statusCode?: number }).statusCode === 302) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'OAuth2 initiation failed' })
  }
})
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
