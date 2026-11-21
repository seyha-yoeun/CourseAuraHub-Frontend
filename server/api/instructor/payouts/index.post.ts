export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/instructor/payouts', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to request a payout',
  })
})
