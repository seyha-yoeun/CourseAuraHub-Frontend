export default defineEventHandler(async (event) => {
  return await backendRequest<{ unreadCount: number }>(event, '/me/notifications/unread-count', {
    fallbackMessage: 'Unable to load notifications',
  })
})
