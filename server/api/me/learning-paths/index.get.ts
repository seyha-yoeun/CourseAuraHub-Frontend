import type { LearningPathProgress } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  return await backendRequest<LearningPathProgress[]>(event, '/me/learning-paths', {
    fallbackMessage: 'Unable to load your learning paths',
  })
})
