export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/refund-requests', {
    fallbackMessage: 'Unable to load your refund requests',
  })
})
