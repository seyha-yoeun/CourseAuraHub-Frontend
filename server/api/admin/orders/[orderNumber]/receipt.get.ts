export default defineEventHandler(async (event) => {
  const orderNumber = encodeURIComponent(getRouterParam(event, 'orderNumber') ?? '')

  return await proxyBackendFile(event, `/admin/orders/${orderNumber}/receipt`, 'Unable to download the receipt')
})
