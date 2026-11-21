export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/stats/retention', {
    query: {
      months: queryString(query.months),
    },
    fallbackMessage: 'Unable to load retention',
  })
})
