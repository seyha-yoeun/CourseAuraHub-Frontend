export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/admin/subscription-plans', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to create the plan',
  })
})
