export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/push/vapid-public-key', {
    optionalAuth: true,
    fallbackMessage: 'Unable to load push settings',
  })
})
