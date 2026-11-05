import type { InstructorProfile } from '~/types/instructorProfile'

export default defineEventHandler(async (event) => {
  return await backendRequest<InstructorProfile>(event, '/instructor/profile', {
    fallbackMessage: 'Unable to load your instructor profile',
  })
})
