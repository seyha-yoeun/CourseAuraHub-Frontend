import type { Order } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<Order[]>(event, '/me/orders', {
    fallbackMessage: 'Unable to load your orders',
  })
})
