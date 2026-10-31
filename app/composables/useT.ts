import { km } from '~/i18n/km'

export type Locale = 'en' | 'km'

/**
 * Translation by English text: t('Add to cart') looks the sentence up in the Khmer dictionary and falls
 * back to the English itself, so untranslated text still reads correctly. {name} fills in a value.
 */
export function useT() {
  const cookie = useCookie<Locale | null>('locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const choice = useState<Locale | null>('locale-choice', () => cookie.value ?? null)
  // The language set in platform settings, for visitors who haven't chosen one
  const platformDefault = useState<Locale>('default-locale', () => 'en')
  const locale = computed<Locale>(() => choice.value ?? platformDefault.value)

  function t(text: string, params?: Record<string, string | number>) {
    const template = locale.value === 'km' ? (km[text] ?? text) : text
    return params
      ? template.replace(/\{(\w+)\}/g, (match, key) => String(params[key] ?? match))
      : template
  }

  function setLocale(value: Locale) {
    choice.value = value
    cookie.value = value
  }

  return { t, locale, setLocale }
}
