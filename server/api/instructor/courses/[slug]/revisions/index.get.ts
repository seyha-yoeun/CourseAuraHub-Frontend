export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/revisions`, {
    fallbackMessage: 'Unable to load course changes',
  })
})
