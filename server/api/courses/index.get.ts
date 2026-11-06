import type { Course } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<Course[]>(event, '/courses', {
    query: {
      status: queryString(query.status),
      category: queryString(query.category),
      search: queryString(query.search),
      sort: queryString(query.sort),
      order: queryString(query.order),
      level: queryString(query.level),
      minPrice: queryString(query.minPrice),
      maxPrice: queryString(query.maxPrice),
      free: queryString(query.free),
      onSale: queryString(query.onSale),
      minRating: queryString(query.minRating),
      minHours: queryString(query.minHours),
      maxHours: queryString(query.maxHours),
    },
    optionalAuth: true,
    fallbackMessage: 'Unable to load courses',
  })
})
