import type { CourseSection, Curriculum, Lesson, LessonFormData } from '~/types'

/**
 * Course curriculum reads (any signed-in user) and section/lesson management (admin).
 */
export function useCurriculum() {
  async function fetchCurriculum(slug: string) {
    return await $fetch<Curriculum>(`/api/courses/${slug}/curriculum`)
  }

  async function createSection(slug: string, title: string) {
    return await $fetch<CourseSection>(`/api/courses/${slug}/sections`, { method: 'POST', body: { title } })
  }

  async function updateSection(slug: string, sectionId: number, data: { title?: string; position?: number }) {
    return await $fetch<CourseSection>(`/api/courses/${slug}/sections/${sectionId}`, { method: 'PUT', body: data })
  }

  async function deleteSection(slug: string, sectionId: number) {
    return await $fetch(`/api/courses/${slug}/sections/${sectionId}`, { method: 'DELETE' })
  }

  async function createLesson(slug: string, sectionId: number, data: LessonFormData) {
    return await $fetch<Lesson>(`/api/courses/${slug}/sections/${sectionId}/lessons`, { method: 'POST', body: data })
  }

  async function updateLesson(slug: string, lessonId: number, data: Partial<LessonFormData> & { position?: number }) {
    return await $fetch<Lesson>(`/api/courses/${slug}/lessons/${lessonId}`, { method: 'PUT', body: data })
  }

  async function deleteLesson(slug: string, lessonId: number) {
    return await $fetch(`/api/courses/${slug}/lessons/${lessonId}`, { method: 'DELETE' })
  }

  return {
    fetchCurriculum,
    createSection,
    updateSection,
    deleteSection,
    createLesson,
    updateLesson,
    deleteLesson,
  }
}

export function formatDuration(minutes: number) {
  if (!minutes) return '0m'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

/** A video position as m:ss or h:mm:ss. */
export function formatPosition(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
}

export function flattenLessons(curriculum: Curriculum | null | undefined) {
  return curriculum?.sections.flatMap(section => section.lessons) ?? []
}
