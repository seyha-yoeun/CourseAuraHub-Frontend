import type { LearningPathProgress } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Learning path slug is required' })
  }

  return await backendRequest<LearningPathProgress>(event, `/me/learning-paths/${encodeURIComponent(slug)}/progress`, {
    fallbackMessage: 'Unable to load your progress',
  })
})
