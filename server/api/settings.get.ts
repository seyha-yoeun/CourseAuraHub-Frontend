import type { PlatformSettingsResponse } from '../utils/apiClient'

export default defineEventHandler(async (event) => {
  return await backendRequest<PlatformSettingsResponse>(event, '/settings', {
    fallbackMessage: 'Unable to load platform settings',
  })
})
