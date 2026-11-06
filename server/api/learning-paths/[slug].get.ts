import type { LearningPath } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Learning path slug is required' })
  }

  return await backendRequest<LearningPath>(event, `/learning-paths/${encodeURIComponent(slug)}`, {
    auth: false,
    fallbackMessage: 'Learning path not found',
  })
})
