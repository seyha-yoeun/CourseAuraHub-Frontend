export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  return await backendRequest<unknown>(event, `/admin/reports/${id}/dismiss`, {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to dismiss the report',
  })
})
