export default defineEventHandler(async (event) => {
  const csrf = await ensureCsrfToken(event, true)

  return {
    headerName: csrf.headerName,
    token: csrf.token,
  }
})
