export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/goals', {
    method: 'PUT',
    body,
    query: {
      timeZone: queryString(query.timeZone),
    },
    csrf: true,
    fallbackMessage: 'Unable to save your weekly goal',
  })
})
