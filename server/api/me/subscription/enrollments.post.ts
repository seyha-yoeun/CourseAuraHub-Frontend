export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/subscription/enrollments', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to enroll through your subscription',
  })
})
