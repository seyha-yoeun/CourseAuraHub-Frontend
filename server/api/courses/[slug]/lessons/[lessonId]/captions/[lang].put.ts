export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')
  const lang = encodeURIComponent(getRouterParam(event, 'lang') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/courses/${slug}/lessons/${lessonId}/captions/${lang}`, {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save the captions',
  })
})
