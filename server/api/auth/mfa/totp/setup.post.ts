import type { BackendTotpSetup } from '../../../../utils/apiClient'

export default defineEventHandler(async (event) => {
  return await backendRequest<BackendTotpSetup>(event, '/auth/mfa/totp/setup', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to start two-factor setup',
  })
})
