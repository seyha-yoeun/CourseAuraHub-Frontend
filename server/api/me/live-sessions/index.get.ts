export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/live-sessions', {
    fallbackMessage: 'Unable to load live sessions',
  })
})
