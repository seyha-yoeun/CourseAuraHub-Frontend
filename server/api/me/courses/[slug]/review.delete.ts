export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  return await backendRequest<null>(event, `/me/courses/${encodeURIComponent(slug)}/review`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete your review',
  })
})
