export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/leaderboard', {
    query: {
      scope: queryString(query.scope),
      course: queryString(query.course),
      limit: queryString(query.limit),
    },
    fallbackMessage: 'Unable to load the leaderboard',
  })
})
