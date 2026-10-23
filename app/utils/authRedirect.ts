const AUTH_PATH_PREFIX = '/auth'
const SAFE_REDIRECT_ORIGIN = 'http://auth-redirect.local'

const PENDING_REDIRECT_KEY = 'courseaura.auth.redirect'
const OAUTH_PROVIDER_KEY = 'courseaura.auth.provider'

export type OAuthProvider = 'google' | 'github' | 'facebook'

const OAUTH_PROVIDERS: OAuthProvider[] = ['google', 'github', 'facebook']

function hasUnsafeCharacters(value: string) {
  if (value.includes('\\')) return true

  for (const char of value) {
    const code = char.charCodeAt(0)
    if (code < 0x20 || code === 0x7f) return true
  }

  return false
}

/**
 * Returns a safe, internal path suitable for post-auth navigation.
 *
 * Rejects absolute URLs, protocol-relative URLs, backslash tricks,
 * control characters and anything that would bounce back into the
 * auth flow (which could cause a redirect loop).
 */
export function getSafeRedirect(value: unknown, fallback = ''): string {
  const candidate = Array.isArray(value) ? value[0] : value

  if (typeof candidate !== 'string') return fallback

  const redirect = candidate.trim()

  if (!redirect || !redirect.startsWith('/')) return fallback
  if (redirect.startsWith('//')) return fallback
  if (hasUnsafeCharacters(redirect)) return fallback

  let parsed: URL

  try {
    parsed = new URL(redirect, SAFE_REDIRECT_ORIGIN)
  } catch {
    return fallback
  }

  // Anything that escaped the placeholder origin is an external redirect.
  if (parsed.origin !== SAFE_REDIRECT_ORIGIN) return fallback

  // Never send users back to an auth page after signing in. Decode once so
  // encoded paths (e.g. /%61uth/login) cannot sneak past the check.
  let pathname = parsed.pathname

  try {
    pathname = decodeURIComponent(pathname)
  } catch {
    return fallback
  }

  if (
    pathname === AUTH_PATH_PREFIX
    || pathname.startsWith(`${AUTH_PATH_PREFIX}/`)
  ) {
    return fallback
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

export function getOAuthErrorMessage(value: unknown): string {
  const error = Array.isArray(value) ? value[0] : value

  if (typeof error !== 'string' || !error) return ''

  if (error === 'access_denied') {
    return 'Sign-in was cancelled or access was denied.'
  }

  if (error === 'oauth_failed' || error === 'server_error') {
    return 'We could not complete sign-in. Please try again.'
  }

  return 'The authentication provider could not complete the sign-in.'
}

function readSession(key: string) {
  if (!import.meta.client) return ''

  try {
    return sessionStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function writeSession(key: string, value: string) {
  if (!import.meta.client) return

  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable (private mode, quota); redirects still work.
  }
}

function removeSession(key: string) {
  if (!import.meta.client) return

  try {
    sessionStorage.removeItem(key)
  } catch {
    // Ignore storage failures.
  }
}

export function getPendingRedirect() {
  return getSafeRedirect(readSession(PENDING_REDIRECT_KEY))
}

export function rememberPendingRedirect(value: unknown) {
  const redirect = getSafeRedirect(value)

  if (redirect) {
    writeSession(PENDING_REDIRECT_KEY, redirect)
  } else {
    removeSession(PENDING_REDIRECT_KEY)
  }
}

export function consumePendingRedirect() {
  const redirect = getPendingRedirect()
  removeSession(PENDING_REDIRECT_KEY)
  return redirect
}

export function rememberOAuthProvider(provider: string) {
  if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) return
  writeSession(OAUTH_PROVIDER_KEY, provider)
}

export function getRememberedOAuthProvider(): OAuthProvider | null {
  const provider = readSession(OAUTH_PROVIDER_KEY)
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider)
    ? provider as OAuthProvider
    : null
}

export function clearPendingOAuth() {
  removeSession(PENDING_REDIRECT_KEY)
  removeSession(OAUTH_PROVIDER_KEY)
}
