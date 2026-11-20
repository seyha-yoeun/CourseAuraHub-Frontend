export default defineEventHandler(async (event) => {
  const number = encodeURIComponent(getRouterParam(event, 'number') ?? '')

  return await backendRequest<unknown>(event, `/me/certificates/${number}/linkedin-url`, {
    fallbackMessage: 'Unable to prepare the LinkedIn link',
  })
})
