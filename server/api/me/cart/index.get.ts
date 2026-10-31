import type { Cart } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<Cart>(event, '/me/cart', {
    fallbackMessage: 'Unable to load your cart',
  })
})
