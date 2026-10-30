import type { Order } from '~/types'

export default defineEventHandler(async (event) => {
  const orderNumber = getRouterParam(event, 'orderNumber')

  if (!orderNumber) {
    throw createError({ statusCode: 400, statusMessage: 'Order number is required' })
  }

  return await backendRequest<Order>(event, `/admin/orders/${encodeURIComponent(orderNumber)}/refund`, {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to refund this order',
  })
})
