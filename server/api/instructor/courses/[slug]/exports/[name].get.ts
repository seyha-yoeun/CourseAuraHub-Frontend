const EXPORTS = new Set(['learners', 'grades'])

export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, 'slug') ?? '')
  const name = getRouterParam(event, 'name') ?? ''

  if (!EXPORTS.has(name)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown export' })
  }

  return await proxyBackendFile(event, `/instructor/courses/${slug}/exports/${name}.csv`, 'Unable to download the export')
})
