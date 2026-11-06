export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/organization-invites/accept', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to accept the invitation',
  })
})
