export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/subscription/resume', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to resume your subscription',
  })
})
