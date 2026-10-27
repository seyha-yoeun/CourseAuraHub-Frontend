import type { MyCourse } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ courseSlug?: string }>(event)

  return await backendRequest<MyCourse>(event, '/me/enrollments', {
    method: 'POST',
    body: { courseSlug: body?.courseSlug },
    csrf: true,
    fallbackMessage: 'Unable to enroll in this course',
  })
})
