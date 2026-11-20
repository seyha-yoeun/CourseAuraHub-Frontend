export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/subscription/cancel', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to cancel your subscription',
  })
})
