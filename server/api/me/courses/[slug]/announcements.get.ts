import type { AnnouncementPage } from '~/types/announcement'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const query = getQuery(event)
  return await backendRequest<AnnouncementPage>(event, `/me/courses/${encodeURIComponent(slug)}/announcements`, {
    query: { page: queryString(query.page), size: queryString(query.size) },
    fallbackMessage: 'Unable to load announcements',
  })
})
