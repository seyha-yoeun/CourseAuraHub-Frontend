export default defineEventHandler(async (event) => {
  const data = await refreshSession(event)

  return toAuthUser(data)
})
