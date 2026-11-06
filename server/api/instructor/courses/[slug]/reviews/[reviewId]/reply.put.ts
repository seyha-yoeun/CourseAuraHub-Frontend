export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const reviewId = encodeURIComponent(getRouterParam(event, 'reviewId') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/reviews/${reviewId}/reply`, {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to post the reply',
  })
})
