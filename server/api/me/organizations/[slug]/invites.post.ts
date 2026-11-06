export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/me/organizations/${slug}/invites`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to send the invitation',
  })
})
