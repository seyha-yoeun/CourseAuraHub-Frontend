import type { QuizAttemptGrant } from '~/types'

export default defineEventHandler(async (event) => {
  const lessonId = getRouterParam(event, 'lessonId')

  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson id is required' })
  }

  const body = await readBody<{ studentId?: number, extraAttempts?: number }>(event)

  return await backendRequest<QuizAttemptGrant>(event, `/admin/lessons/${encodeURIComponent(lessonId)}/quiz/attempt-grants`, {
    method: 'POST',
    body: { studentId: body?.studentId, extraAttempts: body?.extraAttempts },
    csrf: true,
    fallbackMessage: 'Unable to grant extra attempts',
  })
})
