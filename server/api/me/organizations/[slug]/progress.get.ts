export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/me/organizations/${slug}/progress`, {
    fallbackMessage: 'Unable to load member progress',
  })
})
