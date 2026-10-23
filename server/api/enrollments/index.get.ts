import type { Enrollment } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestedLimit = Number(Array.isArray(query.limit) ? query.limit[0] : query.limit)
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(100, Math.floor(requestedLimit))
    : 20

  return await backendRequest<Enrollment[]>(event, '/enrollments', {
    query: { limit },
    fallbackMessage: 'Unable to load recent enrollments',
  })
})
