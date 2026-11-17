export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/admin/course-revisions', {
    fallbackMessage: 'Unable to load course changes',
  })
})
