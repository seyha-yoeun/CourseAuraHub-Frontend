export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/admin/subscription-plans', {
    fallbackMessage: 'Unable to load subscription plans',
  })
})
