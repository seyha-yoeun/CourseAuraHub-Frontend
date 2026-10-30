import type { BackendRecoveryCodes } from '../../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code: string }>(event)

  return await backendRequest<BackendRecoveryCodes>(event, '/auth/mfa/recovery-codes', {
    method: 'POST',
    body: { code: body?.code },
    csrf: true,
    fallbackMessage: 'Unable to generate new recovery codes',
  })
})
