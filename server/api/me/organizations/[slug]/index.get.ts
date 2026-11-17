export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/me/organizations/${slug}`, {
    fallbackMessage: 'Unable to load the organization',
  })
})
