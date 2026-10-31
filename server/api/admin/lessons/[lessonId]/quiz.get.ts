import type { AdminQuiz } from '~/types'

export default defineEventHandler(async (event) => {
  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  return await backendRequest<AdminQuiz>(event, `/admin/lessons/${encodeURIComponent(lessonId)}/quiz`, {
    fallbackMessage: 'Unable to load this quiz',
  })
})
