import type { Course, CourseFormData } from '~/types'
import { getErrorMessage } from '~/utils/apiError'

/**
 * Catalog filters. sort may be "relevance" while searching; price filters use the current price, after any
 * running sale. Unset fields are left out of the request.
 */
export interface CourseQuery {
  status?: string
  category?: string
  search?: string
  sort?: string
  order?: string
  level?: string
  minPrice?: number
  maxPrice?: number
  free?: boolean
  onSale?: boolean
  minRating?: number
  minHours?: number
  maxHours?: number
}

export function useCourses() {
  const courses = ref<Course[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCourses(params?: CourseQuery) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (params?.status && params.status !== 'all') query.set('status', params.status)
      if (params?.category && params.category !== 'all') query.set('category', params.category)
      if (params?.search) query.set('search', params.search)
      if (params?.sort) query.set('sort', params.sort)
      if (params?.order) query.set('order', params.order)
      if (params?.level && params.level !== 'all') query.set('level', params.level)
      for (const key of ['minPrice', 'maxPrice', 'minRating', 'minHours', 'maxHours', 'free', 'onSale'] as const) {
        const value = params?.[key]
        if (value !== undefined && value !== null && !Number.isNaN(value)) query.set(key, String(value))
      }
      const qs = query.toString()
      courses.value = await $fetch<Course[]>(`/api/courses${qs ? `?${qs}` : ''}`)
    }
    catch (e: unknown) {
      // Invalid filter ranges come back as a 400 with a readable message
      error.value = getErrorMessage(e, 'Failed to fetch courses')
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
