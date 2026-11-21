export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/admin/subscription-plans/${id}`, {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save the plan',
  })
})
