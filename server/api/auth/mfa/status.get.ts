import type { BackendMfaStatus } from '../../../utils/apiClient'

export default defineEventHandler(async (event) => {
  return await backendRequest<BackendMfaStatus>(event, '/auth/mfa/status', {
    fallbackMessage: 'Unable to load two-factor status',
  })
})
