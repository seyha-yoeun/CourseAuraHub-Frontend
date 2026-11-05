export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Learning path slug is required' })
  }

  return await backendRequest<null>(event, `/admin/learning-paths/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete the learning path',
  })
})
