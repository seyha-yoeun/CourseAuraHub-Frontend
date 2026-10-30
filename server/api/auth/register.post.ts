import type { BackendVerificationRequired } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    firstName: string
    lastName: string
    email: string
    password: string
  }>(event)

  // Registration creates a pending account; the session starts after POST /api/auth/verify-email.
  return await backendRequest<BackendVerificationRequired>(event, '/auth/register', {
    method: 'POST',
    body,
    auth: false,
    retryOn401: false,
    fallbackMessage: 'Registration failed',
  })
})
