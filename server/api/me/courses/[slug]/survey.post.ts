export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/me/courses/${slug}/survey`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to send your answers',
  })
})
