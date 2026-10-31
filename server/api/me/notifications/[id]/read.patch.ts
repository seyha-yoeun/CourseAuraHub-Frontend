import type { AppNotification } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Notification id is required' })
  }

  return await backendRequest<AppNotification>(event, `/me/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    csrf: true,
    fallbackMessage: 'Unable to update notification',
  })
})
