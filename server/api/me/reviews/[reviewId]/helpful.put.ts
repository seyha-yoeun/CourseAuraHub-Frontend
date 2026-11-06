export default defineEventHandler(async (event) => {
  const reviewId = encodeURIComponent(getRouterParam(event, 'reviewId') ?? '')

  return await backendRequest<unknown>(event, `/me/reviews/${reviewId}/helpful`, {
    method: 'PUT',
    csrf: true,
    fallbackMessage: 'Unable to save your vote',
  })
})
