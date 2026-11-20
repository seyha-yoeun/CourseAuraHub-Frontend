export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/admin/courses/${slug}/revenue-share`, {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save the revenue share',
  })
})
