export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')
  const lang = encodeURIComponent(getRouterParam(event, 'lang') ?? '')

  return await backendRequest<unknown>(event, `/courses/${slug}/lessons/${lessonId}/captions/${lang}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to remove the captions',
  })
})
