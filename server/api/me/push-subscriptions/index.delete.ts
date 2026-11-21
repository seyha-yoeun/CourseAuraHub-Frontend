export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/push-subscriptions', {
    method: 'DELETE',
    body,
    csrf: true,
    fallbackMessage: 'Unable to turn off browser notifications',
  })
})
