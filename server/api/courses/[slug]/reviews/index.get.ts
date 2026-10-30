import type { ReviewPage } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const query = getQuery(event)

  return await backendRequest<ReviewPage>(event, `/courses/${encodeURIComponent(slug)}/reviews`, {
    query: {
      page: queryString(query.page as string | undefined),
      size: queryString(query.size as string | undefined),
    },
    optionalAuth: true,
    fallbackMessage: 'Unable to load reviews',
  })
})
