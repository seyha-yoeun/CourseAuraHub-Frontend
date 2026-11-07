export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/admin/organizations/${slug}/seats`, {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save seats',
  })
})
