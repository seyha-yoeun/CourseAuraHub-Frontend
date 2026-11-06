import type { PublicInstructor } from '~/types/instructorProfile'

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')

  if (!handle) {
    throw createError({ statusCode: 400, statusMessage: 'Instructor handle is required' })
  }

  return await backendRequest<PublicInstructor>(event, `/instructors/${encodeURIComponent(handle)}`, {
    auth: false,
    fallbackMessage: 'Instructor not found',
  })
})
