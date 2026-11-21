interface PublicSettings {
  defaultLanguage?: string
}

// With this many API routes, Nitro's typed $fetch makes this call too deep for TypeScript to check (TS2589),
// so it is called through a plain signature instead
type FetchSettings = (request: string, options: { timeout: number }) => Promise<PublicSettings>

export default defineNuxtPlugin(async () => {
  const platformDefault = useState<string>('default-locale', () => 'en')
  try {
    const settings = await ($fetch as unknown as FetchSettings)('/api/settings/public', { timeout: 2000 })
    if (settings.defaultLanguage?.toLowerCase() === 'km') platformDefault.value = 'km'
  } catch {
    // The site still works in English while the backend is unreachable
  }
})
