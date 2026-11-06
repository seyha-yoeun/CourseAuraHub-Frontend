export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/admin/refund-requests', {
    query: {
      // 'all' is a real filter here, so it is passed through instead of dropped
      status: typeof query.status === 'string' && query.status ? query.status : undefined,
      page: queryString(query.page),
      size: queryString(query.size),
    },
    fallbackMessage: 'Unable to load refund requests',
  })
})
