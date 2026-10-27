import type { LearnerProfile } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<LearnerProfile>(event, '/me/profile', {
    fallbackMessage: 'Unable to load your profile',
  })
})
