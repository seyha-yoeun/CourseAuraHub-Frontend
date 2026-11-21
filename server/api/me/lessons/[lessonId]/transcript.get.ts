export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')
  const query = getQuery(event)

  return await backendRequest<unknown>(event, `/me/lessons/${lessonId}/transcript`, {
    query: {
      lang: queryString(query.lang),
    },
    fallbackMessage: 'Unable to load the transcript',
  })
})
