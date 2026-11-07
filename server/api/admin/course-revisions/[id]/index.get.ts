export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  return await backendRequest<unknown>(event, `/admin/course-revisions/${id}`, {
    fallbackMessage: 'Unable to load the course change',
  })
})
