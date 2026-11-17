import type { CoursePrerequisite, CourseRequirements, PrerequisiteInput } from '~/types/prerequisite'

/** Courses to finish before another; course staff replace the whole list at once. */
export function usePrerequisites() {
  async function fetchRequirements(slug: string) {
    return await $fetch<CourseRequirements>(`/api/courses/${slug}/prerequisites`)
  }

  async function savePrerequisites(slug: string, prerequisites: PrerequisiteInput[]) {
    return await $fetch<CoursePrerequisite[]>(`/api/instructor/courses/${slug}/prerequisites`, {
      method: 'PUT',
      body: { prerequisites },
    })
  }

  return { fetchRequirements, savePrerequisites }
}
