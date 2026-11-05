import type { LearningPath } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  return await backendRequest<LearningPath[]>(event, '/admin/learning-paths', {
    fallbackMessage: 'Unable to load learning paths',
  })
})
