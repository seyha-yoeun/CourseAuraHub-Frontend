import type { LearnerProfile, LearnerProfileUpdate } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<LearnerProfileUpdate>(event)

  return await backendRequest<LearnerProfile>(event, '/me/profile', {
    method: 'PATCH',
    body: {
      firstName: body?.firstName,
      lastName: body?.lastName,
      imageUrl: body?.imageUrl,
      bio: body?.bio,
      website: body?.website,
      twitter: body?.twitter,
    },
    csrf: true,
    fallbackMessage: 'Unable to update your profile',
  })
})
