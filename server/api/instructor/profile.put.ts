import type { InstructorProfile, InstructorProfileForm } from '~/types/instructorProfile'

export default defineEventHandler(async (event) => {
  const body = await readBody<InstructorProfileForm>(event)

  return await backendRequest<InstructorProfile>(event, '/instructor/profile', {
    method: 'PUT',
    body: {
      handle: body?.handle,
      headline: body?.headline,
      linkedinUrl: body?.linkedinUrl,
      githubUrl: body?.githubUrl,
      youtubeUrl: body?.youtubeUrl,
    },
    csrf: true,
    fallbackMessage: 'Unable to save your instructor profile',
  })
})
