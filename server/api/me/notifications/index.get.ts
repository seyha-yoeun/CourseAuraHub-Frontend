import type { NotificationPage } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<NotificationPage>(event, '/me/notifications', {
    query: {
      unreadOnly: queryString(query.unreadOnly as string | undefined),
      page: queryString(query.page as string | undefined),
      size: queryString(query.size as string | undefined),
    },
    fallbackMessage: 'Unable to load notifications',
  })
})
