import type {
  LearnerProfile,
  LearnerProfileUpdate,
  LessonProgressResult,
  MyCourse,
  WishlistItem,
} from '~/types'

/**
 * Self-service calls for the signed-in learner (/api/me/**).
 */
export function useLearning() {
  async function fetchMyCourses() {
    return await $fetch<MyCourse[]>('/api/me/courses')
  }

  async function enroll(courseSlug: string) {
    return await $fetch<MyCourse>('/api/me/enrollments', { method: 'POST', body: { courseSlug } })
  }

  async function setLessonCompleted(lessonId: number, completed: boolean) {
    return await $fetch<LessonProgressResult>(`/api/me/lessons/${lessonId}/completion`, {
      method: completed ? 'PUT' : 'DELETE',
    })
  }

  async function fetchWishlist() {
    return await $fetch<WishlistItem[]>('/api/me/wishlist')
  }

  async function addToWishlist(slug: string) {
    return await $fetch<WishlistItem>(`/api/me/wishlist/${slug}`, { method: 'PUT' })
  }

  async function removeFromWishlist(slug: string) {
    return await $fetch(`/api/me/wishlist/${slug}`, { method: 'DELETE' })
  }

  async function fetchProfile() {
    return await $fetch<LearnerProfile>('/api/me/profile')
  }

  async function updateProfile(data: LearnerProfileUpdate) {
    return await $fetch<LearnerProfile>('/api/me/profile', { method: 'PATCH', body: data })
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    return await $fetch('/api/me/password', { method: 'PUT', body: { currentPassword, newPassword } })
  }

  return {
    fetchMyCourses,
    enroll,
    setLessonCompleted,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    fetchProfile,
    updateProfile,
    changePassword,
  }
}
