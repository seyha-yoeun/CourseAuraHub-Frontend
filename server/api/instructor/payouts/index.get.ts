export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/instructor/payouts', {
    fallbackMessage: 'Unable to load your payouts',
  })
})
