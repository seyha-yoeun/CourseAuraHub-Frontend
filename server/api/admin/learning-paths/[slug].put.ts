import type { LearningPath, LearningPathForm } from '~/types/learningPath'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Learning path slug is required' })
  }

  const body = await readBody<LearningPathForm>(event)

  return await backendRequest<LearningPath>(event, `/admin/learning-paths/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: {
      title: body?.title,
      description: body?.description,
      thumbnail: body?.thumbnail,
      status: body?.status,
      courseSlugs: body?.courseSlugs,
    },
    csrf: true,
    fallbackMessage: 'Unable to update the learning path',
  })
})
