export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/admin/payouts/${id}/approve`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to approve the payout',
  })
})
