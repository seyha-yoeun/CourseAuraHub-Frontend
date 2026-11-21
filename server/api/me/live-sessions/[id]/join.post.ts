export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  return await backendRequest<unknown>(event, `/me/live-sessions/${id}/join`, {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to join the live session',
  })
})
