import type { LessonPosition } from '~/types'

export default defineEventHandler(async (event) => {
  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  const body = await readBody<{ positionSeconds?: number }>(event)

  return await backendRequest<LessonPosition>(event, `/me/lessons/${encodeURIComponent(lessonId)}/position`, {
    method: 'PUT',
    body: { positionSeconds: body?.positionSeconds },
    csrf: true,
    fallbackMessage: 'Unable to save your place in this video',
  })
})
