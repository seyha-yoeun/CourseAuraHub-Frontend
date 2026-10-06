import type { Course, CourseFormData } from '~/types'

export function useCourses() {
  const courses = ref<Course[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCourses(params?: { status?: string; category?: string; search?: string; sort?: string; order?: string }) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (params?.status && params.status !== 'all') query.set('status', params.status)
      if (params?.category && params.category !== 'all') query.set('category', params.category)
      if (params?.search) query.set('search', params.search)
      if (params?.sort) query.set('sort', params.sort)
      if (params?.order) query.set('order', params.order)
      const qs = query.toString()
      courses.value = await $fetch<Course[]>(`/api/courses${qs ? `?${qs}` : ''}`)
    }
    catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to fetch courses'
    }
    finally {
      loading.value = false
    }
  }

  async function getCourse(slug: string) {
    return await $fetch<Course>(`/api/courses/${slug}`)
  }

  async function createCourse(data: CourseFormData) {
    return await $fetch<Course>('/api/courses', { method: 'POST', body: data })
  }

  async function updateCourse(slug: string, data: Partial<CourseFormData>) {
    return await $fetch<Course>(`/api/courses/${slug}`, { method: 'PUT', body: data })
  }

  async function deleteCourse(slug: string) {
    return await $fetch(`/api/courses/${slug}`, { method: 'DELETE' })
  }

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
  }
}
