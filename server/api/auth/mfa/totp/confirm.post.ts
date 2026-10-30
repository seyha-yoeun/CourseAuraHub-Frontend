import type { BackendRecoveryCodes } from '../../../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code: string }>(event)

  return await backendRequest<BackendRecoveryCodes>(event, '/auth/mfa/totp/confirm', {
    method: 'POST',
    body: { code: body?.code },
    csrf: true,
    fallbackMessage: 'Unable to enable two-factor authentication',
  })
})
