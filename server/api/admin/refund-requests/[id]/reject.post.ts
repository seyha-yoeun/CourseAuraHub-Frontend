export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/admin/refund-requests/${id}/reject`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to decline the refund',
  })
})
