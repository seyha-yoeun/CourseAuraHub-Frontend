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

/** How long ago something happened, such as "5m ago". */
export function formatTimeAgo(value: string) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days}d ago` : formatDate(value)
}

export function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
