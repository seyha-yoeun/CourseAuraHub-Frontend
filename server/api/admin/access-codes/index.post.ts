export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/admin/access-codes', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to issue access codes',
  })
})
