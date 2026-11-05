export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const id = getRouterParam(event, 'id')

  if (!slug || !id) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug and announcement id are required' })
  }

  return await backendRequest<null>(event, `/instructor/courses/${encodeURIComponent(slug)}/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete this announcement',
  })
})
