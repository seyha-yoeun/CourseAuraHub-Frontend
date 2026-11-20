export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')

  return await backendRequest<unknown>(event, `/me/lessons/${lessonId}/assistant/conversations`, {
    fallbackMessage: 'Unable to load your conversations',
  })
})
