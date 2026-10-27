import type { Review, ReviewPage } from '~/types'

export function useReviews() {
  async function fetchReviews(slug: string, page = 0, size = 10) {
    return await $fetch<ReviewPage>(`/api/courses/${slug}/reviews`, { query: { page, size } })
  }

  async function fetchMyReview(slug: string) {
    return await $fetch<Review | null>(`/api/me/courses/${slug}/review`)
  }

  async function saveMyReview(slug: string, rating: number, comment: string) {
    return await $fetch<Review>(`/api/me/courses/${slug}/review`, { method: 'PUT', body: { rating, comment } })
  }

  async function deleteMyReview(slug: string) {
    return await $fetch(`/api/me/courses/${slug}/review`, { method: 'DELETE' })
  }

  async function deleteReviewAsAdmin(slug: string, reviewId: number) {
    return await $fetch(`/api/courses/${slug}/reviews/${reviewId}`, { method: 'DELETE' })
  }

  return {
    fetchReviews,
    fetchMyReview,
    saveMyReview,
    deleteMyReview,
    deleteReviewAsAdmin,
  }
}
