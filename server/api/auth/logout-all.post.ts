export default defineEventHandler(async (event) => {
  await backendRequest<null>(event, '/auth/logout-all', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to sign out of all devices',
  })

  clearSessionCookies(event)

  return { success: true }
})
