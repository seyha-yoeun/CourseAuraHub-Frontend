export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/admin/referrals', {
    query: {
      status: queryString(query.status),
      page: queryString(query.page),
      size: queryString(query.size),
    },
    fallbackMessage: 'Unable to load referrals',
  })
})
