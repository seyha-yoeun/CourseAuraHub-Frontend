import type { Course } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  return await backendRequest<Course>(event, `/courses/${encodeURIComponent(slug)}`, {
    optionalAuth: true,
    fallbackMessage: 'Unable to load course',
  })
})
