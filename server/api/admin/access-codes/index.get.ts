export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/admin/access-codes', {
    query: {
      batch: queryString(query.batch),
    },
    fallbackMessage: 'Unable to load access codes',
  })
})
