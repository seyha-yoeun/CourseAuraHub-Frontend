export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')

  return await backendRequest<unknown>(event, `/me/lessons/${lessonId}/media`, {
    fallbackMessage: 'Unable to load the video',
  })
})
