import type { MyCourse } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<MyCourse[]>(event, '/me/courses', {
    fallbackMessage: 'Unable to load your courses',
  })
})
