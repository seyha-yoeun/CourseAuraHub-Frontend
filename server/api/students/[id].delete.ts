export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Student id is required' })
  }

  return await backendRequest<null>(event, `/students/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    csrf: true,
    fallbackMessage: 'Unable to delete student',
  })
})
