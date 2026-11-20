export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/instructor/earnings', {
    query: {
      status: queryString(query.status),
      page: queryString(query.page),
      size: queryString(query.size),
    },
    fallbackMessage: 'Unable to load your earnings',
  })
})
