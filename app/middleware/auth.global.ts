export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server for initial load to avoid hydration issues
  if (import.meta.server) return
  
  const { useAuth } = await import('~/composables/useAuth')
  const auth = useAuth()
  
  // Initialize auth if not already done
  if (!auth.initialized) {
    await auth.initializeAuth()
  }
  
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/callback', '/auth/reset-password', '/']
  const isPublicPath = publicPaths.some(path => path === '/' ? to.path === '/' : to.path.startsWith(path))
  
  // If user is not authenticated and trying to access protected route
  if (!auth.isAuthenticated && !isPublicPath) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }
  
  // Auth pages stay directly accessible, even when already signed in,
  // so the flows can always be previewed and debugged.
})