import type { LessonProgressResult } from '~/types'

export default defineEventHandler(async (event) => {
  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  return await backendRequest<LessonProgressResult>(event, `/me/lessons/${encodeURIComponent(lessonId)}/completion`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to mark lesson incomplete',
  })
})
