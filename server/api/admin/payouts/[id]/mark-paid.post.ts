export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/admin/payouts/${id}/mark-paid`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to mark the payout paid',
  })
})
