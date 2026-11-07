export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const courseSlug = encodeURIComponent(getRouterParam(event, 'courseSlug') ?? '')
  const body = await readBody(event).catch(() => undefined)

  return await backendRequest<unknown>(event, `/me/organizations/${slug}/seats/${courseSlug}/assignments`, {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to assign the seat',
  })
})
