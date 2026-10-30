import type { BackendUser } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  const { imageUrl, ...user } = await backendRequest<BackendUser>(event, '/auth/me', {
    fallbackMessage: 'Unable to load your account',
  })

  return { ...user, avatar: imageUrl || undefined }
})
