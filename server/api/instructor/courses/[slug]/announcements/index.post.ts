import type { Announcement } from '~/types/announcement'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const body = await readBody<{ title?: string, body?: string }>(event)

  return await backendRequest<Announcement>(event, `/instructor/courses/${encodeURIComponent(slug)}/announcements`, {
    method: 'POST',
    body: { title: body?.title, body: body?.body },
    csrf: true,
    fallbackMessage: 'Unable to send this announcement',
  })
})
