import type { Course } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<Course[]>(event, '/me/recommendations', {
    query: { limit: queryString(getQuery(event).limit) },
    fallbackMessage: 'Unable to load recommendations',
  })
})
