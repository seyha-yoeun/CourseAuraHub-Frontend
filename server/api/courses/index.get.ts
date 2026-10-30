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
    },
    optionalAuth: true,
    fallbackMessage: 'Unable to load courses',
  })
})
