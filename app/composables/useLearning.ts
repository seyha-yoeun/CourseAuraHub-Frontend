import type {
  Achievement,
  Certificate,
  CertificateVerification,
  LearnerDashboard,
  LearnerProfile,
  LearnerProfileUpdate,
  LessonProgressResult,
  MyCourse,
  WishlistItem,
} from '~/types'

/** The browser's IANA time zone, so streaks and "today" match the learner's calendar. */
function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined
  }
  catch {
    return undefined
  }
}

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

  async function fetchDashboard() {
    return await $fetch<LearnerDashboard>('/api/me/dashboard', { query: { timeZone: browserTimeZone() } })
  }

  async function fetchAchievements() {
    return await $fetch<Achievement[]>('/api/me/achievements', { query: { timeZone: browserTimeZone() } })
  }

  async function fetchCertificates() {
    return await $fetch<Certificate[]>('/api/me/certificates')
  }

  /** The learner's certificate for a course, or null if they haven't earned one. */
  async function findCertificate(courseSlug: string) {
    const certificates = await fetchCertificates()
    return certificates.find(certificate => certificate.courseSlug === courseSlug) ?? null
  }

  async function verifyCertificate(certificateNumber: string) {
    return await $fetch<CertificateVerification>(`/api/certificates/${encodeURIComponent(certificateNumber)}`)
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
    fetchDashboard,
    fetchAchievements,
    fetchCertificates,
    findCertificate,
    verifyCertificate,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    fetchProfile,
    updateProfile,
    changePassword,
  }
}
