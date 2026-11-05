import type {
  InstructorCard,
  InstructorProfile,
  InstructorProfileForm,
  PublicInstructor
} from '~/types/instructorProfile'

/** Public instructor pages, and the signed-in instructor's own profile settings. */
export function useInstructorProfile() {
  async function fetchMine() {
    return await $fetch<InstructorProfile>('/api/instructor/profile')
  }

  async function updateMine(data: InstructorProfileForm) {
    return await $fetch<InstructorProfile>('/api/instructor/profile', { method: 'PUT', body: data })
  }

  async function fetchInstructors(limit = 24) {
    return await $fetch<InstructorCard[]>('/api/instructors', { query: { limit } })
  }

  async function fetchInstructor(handle: string) {
    return await $fetch<PublicInstructor>(`/api/instructors/${handle}`)
  }

  async function fetchCourseInstructor(slug: string) {
    return await $fetch<InstructorCard>(`/api/courses/${slug}/instructor`)
  }

  return { fetchMine, updateMine, fetchInstructors, fetchInstructor, fetchCourseInstructor }
}
