import type { WishlistItem } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<WishlistItem[]>(event, '/me/wishlist', {
    fallbackMessage: 'Unable to load your wishlist',
  })
})
