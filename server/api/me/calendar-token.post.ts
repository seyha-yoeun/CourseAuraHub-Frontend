export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/calendar-token', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to create a calendar link',
  })
})
