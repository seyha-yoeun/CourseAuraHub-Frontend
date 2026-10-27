import type { Curriculum } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  return await backendRequest<Curriculum>(event, `/courses/${encodeURIComponent(slug)}/curriculum`, {
    fallbackMessage: 'Unable to load curriculum',
  })
})
