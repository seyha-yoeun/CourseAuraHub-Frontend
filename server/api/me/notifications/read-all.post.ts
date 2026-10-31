export default defineEventHandler(async (event) => {
  return await backendRequest<{ unreadCount: number }>(event, '/me/notifications/read-all', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to update notifications',
  })
})
