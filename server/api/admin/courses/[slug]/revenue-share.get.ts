export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/admin/courses/${slug}/revenue-share`, {
    fallbackMessage: 'Unable to load the revenue share',
  })
})
