export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/live-sessions`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to schedule the live session',
  })
})
