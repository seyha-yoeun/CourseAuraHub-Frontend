import type { LearningPath, LearningPathForm } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  const body = await readBody<LearningPathForm>(event)

  return await backendRequest<LearningPath>(event, '/admin/learning-paths', {
    method: 'POST',
    body: {
      title: body?.title,
      description: body?.description,
      thumbnail: body?.thumbnail,
      status: body?.status,
      courseSlugs: body?.courseSlugs,
    },
    csrf: true,
    fallbackMessage: 'Unable to create the learning path',
  })
})
