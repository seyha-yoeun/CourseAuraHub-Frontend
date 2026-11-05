import type { InstructorCard } from '~/types/instructorProfile'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  // 404 when the course is admin-managed or its instructor has no public profile
  return await backendRequest<InstructorCard>(event, `/courses/${encodeURIComponent(slug)}/instructor`, {
    auth: false,
    fallbackMessage: 'Instructor profile not found',
  })
})
