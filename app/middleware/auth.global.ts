const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/callback']

function isPublicPath(path: string) {
  return PUBLIC_PATHS.includes(path)
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

  if (auth.isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
    return navigateTo(auth.homeRoute)
  }

  // Let the callback page finish its fetch/redirect flow.
  if (to.path === '/auth/callback') {
    return
  }

  if (to.meta.requiresAdmin === true && !auth.isAdmin) {
    return navigateTo('/courses')
  }
})
