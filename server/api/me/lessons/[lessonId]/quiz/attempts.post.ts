import type { QuizResult } from '~/types'

export default defineEventHandler(async (event) => {
  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  const body = await readBody<{ answers?: Record<string, number> }>(event)

  return await backendRequest<QuizResult>(event, `/me/lessons/${encodeURIComponent(lessonId)}/quiz/attempts`, {
    method: 'POST',
    body: { answers: body?.answers },
    csrf: true,
    fallbackMessage: 'Unable to submit this quiz',
  })
})
