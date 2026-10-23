import type { Student } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<Student[]>(event, '/students', {
    query: {
      status: queryString(query.status),
      search: queryString(query.search),
    },
    fallbackMessage: 'Unable to load students',
  })
})
