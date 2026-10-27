import type { WishlistItem } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  return await backendRequest<WishlistItem>(event, `/me/wishlist/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    csrf: true,
    fallbackMessage: 'Unable to save course to wishlist',
  })
})
