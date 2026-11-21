/**
 * Picks the page transition between auth screens (they share layouts/auth.vue, which
 * keeps the frame mounted). Log in <-> Sign up slide in the direction of the tab switch;
 * any other auth-to-auth move cross-fades. Classes live in assets/css/main.css.
 */
const TAB_ORDER: Record<string, number> = {
  '/auth/login': 0,
  '/auth/register': 1,
}

function normalize(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

export default defineNuxtRouteMiddleware((to, from) => {
  const toPath = normalize(to.path)
  const fromPath = normalize(from.path)

  if (toPath === fromPath || !toPath.startsWith('/auth/') || !fromPath.startsWith('/auth/')) return

  const fromIndex = TAB_ORDER[fromPath]
  const toIndex = TAB_ORDER[toPath]

  let name = 'auth-fade'
  if (fromIndex !== undefined && toIndex !== undefined) {
    name = toIndex > fromIndex ? 'auth-slide' : 'auth-slide-back'
  }

  to.meta.pageTransition = { name }
})
