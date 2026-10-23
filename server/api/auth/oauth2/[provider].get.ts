export default defineEventHandler((event) => {
  const provider = getRouterParam(event, 'provider')
  const validProviders = ['google', 'github', 'facebook']

  if (!provider || !validProviders.includes(provider)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth2 provider' })
  }

  const backendOrigin = getBackendOrigin()
  return sendRedirect(event, `${backendOrigin}/api/v1/auth/oauth2/authorization/${provider}`, 302)
})
