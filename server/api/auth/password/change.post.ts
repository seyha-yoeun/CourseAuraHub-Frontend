import type { BackendAuthData } from '../../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ currentPassword: string; newPassword: string }>(event)

  const data = await backendRequest<BackendAuthData>(event, '/auth/password/change', {
    method: 'POST',
    body: {
      currentPassword: body?.currentPassword,
      newPassword: body?.newPassword,
    },
    csrf: true,
    fallbackMessage: 'Unable to change your password',
  })

  // Other sessions are signed out; this browser continues on the fresh session.
  setSessionCookies(event, data)

  return toAuthUser(data)
})
