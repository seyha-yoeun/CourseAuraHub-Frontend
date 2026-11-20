export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, '/me/referral/claim', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to use this referral code',
  })
})
