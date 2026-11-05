import type { CourseAnalytics } from '~/types/analytics'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  return await backendRequest<CourseAnalytics>(event, `/instructor/courses/${encodeURIComponent(slug)}/analytics`, {
    fallbackMessage: 'Unable to load course analytics',
  })
})
