export default defineEventHandler(async (event) => {
  const data = await backendRequest<unknown>(event, '/me/data-export', {
    fallbackMessage: 'Unable to export your data',
  })

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="course-aura-hub-data-${new Date().toISOString().slice(0, 10)}.json"`,
    'Cache-Control': 'private, no-store',
  })

  return JSON.stringify(data, null, 2)
})
