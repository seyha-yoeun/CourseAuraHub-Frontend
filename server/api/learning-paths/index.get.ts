import type { LearningPath } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  return await backendRequest<LearningPath[]>(event, '/learning-paths', {
    auth: false,
    fallbackMessage: 'Unable to load learning paths',
  })
})
