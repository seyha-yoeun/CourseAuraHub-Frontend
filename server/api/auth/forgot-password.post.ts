export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event)

  await backendRequest<null>(event, '/auth/forgot-password', {
    method: 'POST',
    body: { email: body?.email },
    auth: false,
    retryOn401: false,
    fallbackMessage: 'Failed to send reset email',
  })

  return { success: true }
})
