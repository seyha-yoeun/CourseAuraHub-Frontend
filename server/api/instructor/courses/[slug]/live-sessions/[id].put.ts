export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/live-sessions/${id}`, {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save the live session',
  })
})
