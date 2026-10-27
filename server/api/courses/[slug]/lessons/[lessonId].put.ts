import type { Lesson, LessonFormData } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  const body = await readBody<Partial<LessonFormData> & { position?: number }>(event)

  return await backendRequest<Lesson>(event, `/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonId)}`, {
    method: 'PUT',
    body: {
      title: body?.title,
      type: body?.type,
      durationMinutes: body?.durationMinutes,
      contentUrl: body?.contentUrl,
      preview: body?.preview,
      position: body?.position,
    },
    csrf: true,
    fallbackMessage: 'Unable to update lesson',
  })
})
