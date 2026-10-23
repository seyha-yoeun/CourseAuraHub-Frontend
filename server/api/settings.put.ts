import type { PlatformSettingsResponse } from '../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return await backendRequest<PlatformSettingsResponse>(event, '/settings', {
    method: 'PUT',
    body,
    csrf: true,
    fallbackMessage: 'Unable to save platform settings',
  })
})
