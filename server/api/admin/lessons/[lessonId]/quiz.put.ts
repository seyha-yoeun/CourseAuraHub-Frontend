import type { AdminQuiz } from '~/types'

export default defineEventHandler(async (event) => {
  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  const body = await readBody(event)

  return await backendRequest<AdminQuiz>(event, `/admin/lessons/${encodeURIComponent(lessonId)}/quiz`, {
    method: 'PUT',
    body: {
      passPercent: body?.passPercent,
      questions: body?.questions,
      maxAttempts: body?.maxAttempts,
      retryCooldownMinutes: body?.retryCooldownMinutes,
      timeLimitMinutes: body?.timeLimitMinutes,
      questionsPerAttempt: body?.questionsPerAttempt,
      shuffle: body?.shuffle,
    },
    csrf: true,
    fallbackMessage: 'Unable to save this quiz',
  })
})
