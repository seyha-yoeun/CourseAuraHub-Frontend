import type { LearnerDashboard } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<LearnerDashboard>(event, '/me/dashboard', {
    query: {
      timeZone: queryString(query.timeZone as string | undefined),
    },
    fallbackMessage: 'Unable to load your learning dashboard',
  })
})
