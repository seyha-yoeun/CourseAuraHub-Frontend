export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/notification-preferences', {
    fallbackMessage: 'Unable to load email preferences',
  })
})
