export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/subscription/pay', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to pay for your subscription',
  })
})
