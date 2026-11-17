export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  return await backendRequest<unknown>(event, `/admin/access-codes/${id}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to revoke the code',
  })
})
