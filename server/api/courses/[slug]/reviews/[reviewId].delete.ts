export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const reviewId = getRouterParam(event, 'reviewId')

  if (!reviewId) {
    throw createError({ statusCode: 400, statusMessage: 'Review id is required' })
  }

  return await backendRequest<null>(event, `/courses/${encodeURIComponent(slug)}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete review',
  })
})
