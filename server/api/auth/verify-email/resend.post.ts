import type { BackendVerificationRequired } from '../../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event)

  return await backendRequest<BackendVerificationRequired>(event, '/auth/verify-email/resend', {
    method: 'POST',
    body: { email: body?.email },
    auth: false,
    retryOn401: false,
    fallbackMessage: 'Unable to send a new verification code',
  })
})
