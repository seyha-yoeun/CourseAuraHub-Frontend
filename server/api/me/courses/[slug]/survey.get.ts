export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/me/courses/${slug}/survey`, {
    fallbackMessage: 'Unable to load the survey',
  })
})
