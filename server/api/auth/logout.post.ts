export default defineEventHandler(async (event) => {
  await logoutBackend(event)
  clearSessionCookies(event)

  return { success: true }
})
