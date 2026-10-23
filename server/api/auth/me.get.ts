import type { BackendUser } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  return await backendRequest<BackendUser>(event, '/auth/me', {
    fallbackMessage: 'Unable to load your account',
  })
})
