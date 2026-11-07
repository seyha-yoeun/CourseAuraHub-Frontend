const EXPORTS = new Set(['orders', 'enrollments', 'learners', 'member-card-ledger', 'audit-log'])

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') ?? ''

  if (!EXPORTS.has(name)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown export' })
  }

  const query = getQuery(event)
  const params = new URLSearchParams()
  for (const key of ['from', 'to', 'status']) {
    const value = queryString(query[key])
    if (value) params.set(key, value)
  }
  const qs = params.toString()

  return await proxyBackendFile(event, `/admin/exports/${name}.csv${qs ? `?${qs}` : ''}`, 'Unable to download the export')
})
