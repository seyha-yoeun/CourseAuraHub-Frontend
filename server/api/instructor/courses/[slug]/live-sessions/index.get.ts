export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')

  return await backendRequest<unknown>(event, `/instructor/courses/${slug}/live-sessions`, {
    fallbackMessage: 'Unable to load live sessions',
  })
})
