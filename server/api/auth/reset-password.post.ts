export default defineEventHandler(async (event) => {
  const body = await readBody<{
    token: string
    password: string
    confirmPassword: string
  }>(event)

  await backendRequest<null>(event, '/auth/reset-password', {
    method: 'POST',
    body: {
      token: body?.token,
      password: body?.password,
      confirmPassword: body?.confirmPassword,
    },
    auth: false,
    retryOn401: false,
    fallbackMessage: 'Failed to reset password',
  })

  // A reset signs out every session, including any in this browser.
  clearSessionCookies(event)

  return { success: true }
})
