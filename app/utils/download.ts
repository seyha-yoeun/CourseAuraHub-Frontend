/**
 * Fetches a file from one of our server routes and saves it, so the session cookie is sent and an
 * error comes back as a normal API error instead of a broken download.
 */
export async function downloadFile(url: string, filename: string, query?: Record<string, string | number | undefined>) {
  const blob = await $fetch<Blob>(url, { query, responseType: 'blob' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}
