import type { CourseSection } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const sectionId = getRouterParam(event, 'sectionId')

  if (!sectionId) {
    throw createError({ statusCode: 400, statusMessage: 'Section id is required' })
  }

  const body = await readBody<{ title?: string; position?: number }>(event)

  return await backendRequest<CourseSection>(event, `/courses/${encodeURIComponent(slug)}/sections/${encodeURIComponent(sectionId)}`, {
    method: 'PUT',
    body: { title: body?.title, position: body?.position },
    csrf: true,
    fallbackMessage: 'Unable to update section',
  })
})
