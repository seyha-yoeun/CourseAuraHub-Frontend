import type { BackendSession } from '../../../utils/apiClient'

export default defineEventHandler(async (event) => {
  return await backendRequest<BackendSession[]>(event, '/auth/sessions', {
    fallbackMessage: 'Unable to load your sessions',
  })
})
