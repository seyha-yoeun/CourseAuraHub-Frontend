export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/organizations', {
    fallbackMessage: 'Unable to load your organizations',
  })
})
