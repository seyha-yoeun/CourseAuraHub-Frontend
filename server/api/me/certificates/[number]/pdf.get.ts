export default defineEventHandler(async (event) => {
  const number = getRouterParam(event, 'number')

  if (!number) {
    throw createError({ statusCode: 400, statusMessage: 'Certificate number is required' })
  }

  return await proxyBackendFile(
    event,
    `/me/certificates/${encodeURIComponent(number)}/pdf?lang=${getQuery(event).lang === 'km' ? 'km' : 'en'}`,
    'Unable to download the certificate',
  )
})
