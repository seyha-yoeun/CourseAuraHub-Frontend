import type { Cart } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course is required' })
  }

  return await backendRequest<Cart>(event, `/me/cart/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    csrf: true,
    fallbackMessage: 'Unable to add this course to your cart',
  })
})
