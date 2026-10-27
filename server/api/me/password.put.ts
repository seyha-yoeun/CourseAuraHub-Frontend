import type { BackendAuthData } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ currentPassword?: string; newPassword?: string }>(event)

  const data = await backendRequest<BackendAuthData>(event, '/me/password', {
    method: 'PUT',
    body: {
      currentPassword: body?.currentPassword,
      newPassword: body?.newPassword,
    },
    csrf: true,
    fallbackMessage: 'Unable to change your password',
  })

  // Changing the password revokes the old refresh token, so store the fresh pair
  setSessionCookies(event, data, getCookie(event, 'remember_me') === '1')

  return { success: true }
})
