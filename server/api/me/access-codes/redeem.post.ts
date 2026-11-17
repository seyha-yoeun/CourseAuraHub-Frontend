export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/access-codes/redeem', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to redeem the code',
  })
})
