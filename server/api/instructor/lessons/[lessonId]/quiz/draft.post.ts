export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/instructor/lessons/${lessonId}/quiz/draft`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to draft quiz questions',
  })
})
