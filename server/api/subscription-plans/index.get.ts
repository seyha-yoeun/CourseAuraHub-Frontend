export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/subscription-plans', {
    optionalAuth: true,
    fallbackMessage: 'Unable to load subscription plans',
  })
})
