export default defineEventHandler(async (event) => {
  const orderNumber = encodeURIComponent(getRouterParam(event, 'orderNumber') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/me/orders/${orderNumber}/refund-request`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to request a refund',
  })
})
