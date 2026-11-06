export default defineEventHandler(async (event) => {
  const reviewId = encodeURIComponent(getRouterParam(event, 'reviewId') ?? '')

  return await backendRequest<unknown>(event, `/me/reviews/${reviewId}/helpful`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to remove your vote',
  })
})
