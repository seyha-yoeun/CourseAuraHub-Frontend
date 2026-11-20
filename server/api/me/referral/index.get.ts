export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/me/referral', {
    fallbackMessage: 'Unable to load your referral code',
  })
})
