import type { Achievement } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<Achievement[]>(event, '/me/achievements', {
    query: {
      timeZone: queryString(query.timeZone as string | undefined),
    },
    fallbackMessage: 'Unable to load your achievements',
  })
})
