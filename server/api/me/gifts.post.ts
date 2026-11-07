export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/gifts', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to send the gift',
  })
})
