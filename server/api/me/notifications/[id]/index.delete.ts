export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Notification id is required' })
  }

  return await backendRequest<null>(event, `/me/notifications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete notification',
  })
})
