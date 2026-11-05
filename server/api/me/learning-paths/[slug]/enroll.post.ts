import type { LearningPathEnrollResult } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Learning path slug is required' })
  }

  return await backendRequest<LearningPathEnrollResult>(event, `/me/learning-paths/${encodeURIComponent(slug)}/enroll`, {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to enroll in this learning path',
  })
})
