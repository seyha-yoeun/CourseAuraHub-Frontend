export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')

  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid session id' })
  }

  await backendRequest<null>(event, `/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to sign out that session',
  })

  return { success: true }
})
