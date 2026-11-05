export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const body = await readBody<{ sequentialLessons?: boolean }>(event)

  return await backendRequest<{ sequentialLessons: boolean }>(event, `/courses/${encodeURIComponent(slug)}/curriculum/settings`, {
    method: 'PUT',
    body: { sequentialLessons: body?.sequentialLessons },
    csrf: true,
    fallbackMessage: 'Unable to update curriculum settings',
  })
})
