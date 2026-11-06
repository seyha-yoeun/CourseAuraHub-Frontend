import type { InstructorCard } from '~/types/instructorProfile'

export default defineEventHandler(async (event) => {
  return await backendRequest<InstructorCard[]>(event, '/instructors', {
    query: { limit: queryString(getQuery(event).limit) },
    auth: false,
    fallbackMessage: 'Unable to load instructors',
  })
})
