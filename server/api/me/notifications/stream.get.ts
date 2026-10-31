export default defineEventHandler(async (event) => {
  return await proxyBackendStream(event, '/me/notifications/stream')
})
