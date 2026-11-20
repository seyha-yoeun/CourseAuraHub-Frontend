export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/live-sessions/${id}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to cancel the live session',
  })
})
