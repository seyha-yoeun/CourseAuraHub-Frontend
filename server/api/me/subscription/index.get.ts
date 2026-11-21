export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/subscription', {
    fallbackMessage: 'Unable to load your subscription',
  })
})
