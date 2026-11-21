export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<unknown>(event, '/stats/funnel', {
    query: {
      from: queryString(query.from),
      to: queryString(query.to),
      course: queryString(query.course),
    },
    fallbackMessage: 'Unable to load the enrollment funnel',
  })
})
