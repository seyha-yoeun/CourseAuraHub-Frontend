export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const userId = encodeURIComponent(getRouterParam(event, 'userId') ?? '')

  return await backendRequest<unknown>(event, `/me/organizations/${slug}/members/${userId}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to remove the member',
  })
})
