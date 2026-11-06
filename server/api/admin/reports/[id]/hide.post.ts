export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  return await backendRequest<unknown>(event, `/admin/reports/${id}/hide`, {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to hide this content',
  })
})
