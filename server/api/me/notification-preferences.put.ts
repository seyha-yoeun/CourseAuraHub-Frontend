export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/notification-preferences', {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save email preferences',
  })
})
