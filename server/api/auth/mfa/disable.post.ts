export default defineEventHandler(async (event) => {
  const body = await readBody<{ code: string; password?: string }>(event)

  await backendRequest<null>(event, '/auth/mfa/disable', {
    method: 'POST',
    body: {
      code: body?.code,
      password: body?.password || undefined,
    },
    csrf: true,
    fallbackMessage: 'Unable to disable two-factor authentication',
  })

  return { success: true }
})
