export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  return await backendRequest<null>(event, `/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonId)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete lesson',
  })
})
