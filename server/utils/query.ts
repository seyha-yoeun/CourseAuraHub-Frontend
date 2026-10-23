export function queryString(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  const normalized = raw?.trim()

  if (!normalized || normalized === 'all') {
    return undefined
  }

  return normalized
}
