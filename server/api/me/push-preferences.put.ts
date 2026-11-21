export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/push-preferences', {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save push preferences',
  })
})
