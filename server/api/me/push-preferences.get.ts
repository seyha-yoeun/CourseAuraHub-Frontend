export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/push-preferences', {
    fallbackMessage: 'Unable to load push preferences',
  })
})
