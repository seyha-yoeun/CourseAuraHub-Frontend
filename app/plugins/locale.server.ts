export default defineNuxtPlugin(async () => {
  const platformDefault = useState<string>('default-locale', () => 'en')
  try {
    const settings = await $fetch<{ defaultLanguage?: string }>('/api/settings/public', { timeout: 2000 })
    if (settings.defaultLanguage?.toLowerCase() === 'km') platformDefault.value = 'km'
  } catch {
    // The site still works in English while the backend is unreachable
  }
})
