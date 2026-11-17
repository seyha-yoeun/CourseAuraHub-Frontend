export default defineEventHandler(async (event) => {
  const orderNumber = encodeURIComponent(getRouterParam(event, 'orderNumber') ?? '')

  return await backendRequest<unknown>(event, `/me/orders/${orderNumber}/refund-eligibility`, {
    fallbackMessage: 'Unable to check refund eligibility',
  })
})
