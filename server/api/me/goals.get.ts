export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/me/goals', {
    query: {
      timeZone: queryString(query.timeZone),
    },
    fallbackMessage: 'Unable to load your weekly goal',
  })
})
