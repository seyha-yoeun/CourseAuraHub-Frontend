export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/admin/reports', {
    query: {
      page: queryString(query.page),
      size: queryString(query.size),
    },
    fallbackMessage: 'Unable to load reports',
  })
})
