export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/courses/${slug}/changelog`, {
    optionalAuth: true,
    fallbackMessage: 'Unable to load the changelog',
  })
})
