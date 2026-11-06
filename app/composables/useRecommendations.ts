import type { Course } from '~/types'

/** Related courses for a course page, and personal suggestions from enrolled and wishlisted courses. */
export function useRecommendations() {
  async function fetchRelated(slug: string, limit = 3) {
    return await $fetch<Course[]>(`/api/courses/${slug}/related`, { query: { limit } })
  }

  async function fetchRecommendations(limit = 3) {
    return await $fetch<Course[]>('/api/me/recommendations', { query: { limit } })
  }

  return { fetchRelated, fetchRecommendations }
}
