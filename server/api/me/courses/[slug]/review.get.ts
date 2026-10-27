import type { Review } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  return await backendRequest<Review | null>(event, `/me/courses/${encodeURIComponent(slug)}/review`, {
    fallbackMessage: 'Unable to load your review',
  })
})
