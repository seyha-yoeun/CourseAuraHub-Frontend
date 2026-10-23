export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  const apiBase = config.public.apiBase || 'http://localhost:8080/api/v1'
  
  try {
    const response = await $fetch(`${apiBase}/auth/reset-password`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        ...getCSRFHeaders(event)
      }
    })
    
    return response
  } catch (error: unknown) {
    throw createError({
      statusCode: (error as { response?: { status: number } }).response?.status || 400,
      statusMessage: (error as { response?: { _data?: { message: string } } }).response?._data?.message || 'Failed to reset password'
    })
  }
})

function getCSRFHeaders(event: ReturnType<typeof defineEventHandler>) {
  const cookies = parseCookies(event)
  const xsrfToken = cookies['XSRF-TOKEN']
  return xsrfToken ? { 'X-CSRF-TOKEN': xsrfToken } : {}
}