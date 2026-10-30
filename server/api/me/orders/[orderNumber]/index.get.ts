import type { Order } from '~/types'

export default defineEventHandler(async (event) => {
  const orderNumber = getRouterParam(event, 'orderNumber')

  if (!orderNumber) {
    throw createError({ statusCode: 400, statusMessage: 'Order number is required' })
  }

  return await backendRequest<Order>(event, `/me/orders/${encodeURIComponent(orderNumber)}`, {
    fallbackMessage: 'Unable to load this order',
  })
})
