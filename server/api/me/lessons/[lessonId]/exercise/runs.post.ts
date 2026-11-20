export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/me/lessons/${lessonId}/exercise/runs`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to run your code',
  })
})
