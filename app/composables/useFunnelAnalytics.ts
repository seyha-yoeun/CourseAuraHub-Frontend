import type { CatalogEvent, EnrollmentFunnel, Retention } from '~/types/funnel'

const VISITOR_KEY = 'catalog-visitor-id'

// A random id for anonymous visitors, so the funnel counts people rather than page loads
function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return undefined
  }
}

/** Catalog events for the enrollment funnel, and the admin funnel and retention reports. */
export function useFunnelAnalytics() {
  /** Fire and forget: analytics never interrupts the visitor. Repeats within 30 minutes count once. */
  function track(courseSlug: string, event: CatalogEvent) {
    if (!import.meta.client || !courseSlug) return
    $fetch('/api/events', { method: 'POST', body: { courseSlug, event, visitorId: visitorId() } }).catch(() => {})
  }

  async function fetchFunnel(from?: string, to?: string, course?: string | null) {
    return await $fetch<EnrollmentFunnel>('/api/stats/funnel', { query: { from, to, course: course || undefined } })
  }

  async function fetchRetention(months = 6) {
    return await $fetch<Retention>('/api/stats/retention', { query: { months } })
  }

  return { track, fetchFunnel, fetchRetention }
}
