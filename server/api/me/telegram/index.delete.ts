export default defineEventHandler(async (event) => {
  return await backendRequest<null>(event, '/me/telegram', {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to disconnect Telegram',
  })
})
