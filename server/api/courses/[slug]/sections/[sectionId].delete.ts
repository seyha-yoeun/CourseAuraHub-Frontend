export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const sectionId = getRouterParam(event, 'sectionId')

  if (!sectionId) {
    throw createError({ statusCode: 400, statusMessage: 'Section id is required' })
  }

  return await backendRequest<null>(event, `/courses/${encodeURIComponent(slug)}/sections/${encodeURIComponent(sectionId)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete section',
  })
})
