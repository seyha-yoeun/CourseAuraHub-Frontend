export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/assistant/usage', {
    fallbackMessage: 'Unable to load your assistant allowance',
  })
})
