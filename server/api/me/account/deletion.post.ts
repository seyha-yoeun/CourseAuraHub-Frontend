export default defineEventHandler(async (event) => {
  const body = await readBody<{ confirmation?: unknown; password?: unknown }>(event)

  await backendRequest<unknown>(event, '/me/account/deletion', {
    method: 'POST',
    body: {
      confirmation: typeof body?.confirmation === 'string' ? body.confirmation : '',
      password: typeof body?.password === 'string' ? body.password : undefined,
    },
    csrf: true,
    fallbackMessage: 'Unable to delete your account',
  })

  clearSessionCookies(event)
  return { deleted: true }
})
