import type { Review } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const body = await readBody<{ rating?: number; comment?: string }>(event)

  return await backendRequest<Review>(event, `/me/courses/${encodeURIComponent(slug)}/review`, {
    method: 'PUT',
    body: { rating: body?.rating, comment: body?.comment },
    csrf: true,
    fallbackMessage: 'Unable to save your review',
  })
})
