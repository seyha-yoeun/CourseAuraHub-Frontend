import { getSafeRedirect } from '~/utils/authRedirect'

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/privacy',
  '/terms',
  '/support',
]

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '')
  return normalized || '/'
}

function isPublicPath(path: string) {
  return PUBLIC_PATHS.includes(normalizePath(path))
}

function isAuthEntryPath(path: string) {
  const normalized = normalizePath(path)
  return normalized === '/auth/login' || normalized === '/auth/register'
}

function hasSessionCookie() {
  const headers = useRequestHeaders(['cookie'])
  return /(?:^|;\s*)(?:access_token|refresh_token)=/.test(headers.cookie || '')
}

export default defineNuxtRouteMiddleware(async (to) => {
  const isPublic = isPublicPath(to.path)

  if (import.meta.server) {
    // SSR guard: avoid rendering protected pages for visitors with no session at all.
    if (!isPublic && !hasSessionCookie()) {
      return navigateTo({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      })
    }

    return
  }

  const auth = useAuth()

  if (!auth.initialized) {
    await auth.initializeAuth()
  }

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo({
      path: '/auth/login',
      query: {
        redirect: to.fullPath,
        ...(auth.sessionExpired ? { session: 'expired' } : {}),
      },
    })
  }

  if (auth.isAuthenticated && isAuthEntryPath(to.path)) {
    // Honour a requested destination (e.g. a protected page the user was
    // originally trying to reach) instead of always going to the home page.
    return navigateTo(getSafeRedirect(to.query.redirect, auth.homeRoute))
  }

  // Let the callback page finish its fetch/redirect flow.
  if (normalizePath(to.path) === '/auth/callback') {
    return
  }

  if (to.meta.requiresAdmin === true && !auth.isAdmin) {
    return navigateTo(auth.homeRoute)
  }
})
