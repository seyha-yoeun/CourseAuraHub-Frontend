export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  return await backendRequest<null>(event, `/me/wishlist/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to remove course from wishlist',
  })
})
