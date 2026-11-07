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

  async function setHelpful(reviewId: number, helpful: boolean) {
    return await $fetch<Review>(`/api/me/reviews/${reviewId}/helpful`, { method: helpful ? 'PUT' : 'DELETE' })
  }

  /** The course staff's public answer to a review; posting again replaces it. */
  async function replyToReview(slug: string, reviewId: number, body: string) {
    return await $fetch<Review>(`/api/instructor/courses/${slug}/reviews/${reviewId}/reply`, { method: 'PUT', body: { body } })
  }

  async function deleteReply(slug: string, reviewId: number) {
    return await $fetch(`/api/instructor/courses/${slug}/reviews/${reviewId}/reply`, { method: 'DELETE' })
  }

  return {
    fetchReviews,
    fetchMyReview,
    saveMyReview,
    deleteMyReview,
    deleteReviewAsAdmin,
    setHelpful,
    replyToReview,
    deleteReply,
  }
}
