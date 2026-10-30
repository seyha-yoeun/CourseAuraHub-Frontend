import type { CourseSection } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const body = await readBody<{ title?: string; position?: number }>(event)

  return await backendRequest<CourseSection>(event, `/courses/${encodeURIComponent(slug)}/sections`, {
    method: 'POST',
    body: { title: body?.title, position: body?.position },
    csrf: true,
    fallbackMessage: 'Unable to create section',
  })
})
