export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/events', {
    method: 'POST',
    body,
    optionalAuth: true,
    csrf: true,
    fallbackMessage: 'Unable to record the event',
  })
})
