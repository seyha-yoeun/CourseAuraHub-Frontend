export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/survey`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete the survey',
  })
})
