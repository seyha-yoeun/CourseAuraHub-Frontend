export default defineEventHandler(async (event) => {
  return await backendRequest<unknown>(event, '/admin/organizations', {
    fallbackMessage: 'Unable to load organizations',
  })
})
