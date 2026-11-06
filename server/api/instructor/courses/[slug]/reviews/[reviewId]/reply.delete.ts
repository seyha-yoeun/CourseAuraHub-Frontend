export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const reviewId = encodeURIComponent(getRouterParam(event, 'reviewId') ?? '')

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/reviews/${reviewId}/reply`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to remove the reply',
  })
})
