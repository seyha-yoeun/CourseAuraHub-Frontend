export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/revisions/pending`, {
    method: 'PATCH',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save the change summary',
  })
})
