/** An ISO timestamp as a datetime-local input value, in the browser's time zone. */
export function toLocalInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

/** A datetime-local input value as an ISO timestamp; undefined when empty. */
export function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : undefined
}

export function formatDateTime(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
