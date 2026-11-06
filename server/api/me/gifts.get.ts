export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/gifts', {
    fallbackMessage: 'Unable to load your gifts',
  })
})
