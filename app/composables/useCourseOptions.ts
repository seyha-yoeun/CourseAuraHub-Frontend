import type { Course } from '~/types'

/**
 * The catalog as dropdown options, for forms that pick a course (access codes, paths, seats,
 * prerequisites). Published courses only unless `includeUnpublished` is set; only admins get those.
 */
export async function useCourseOptions(includeUnpublished = false) {
  const { data, pending } = await useAsyncData(
    `course-options-${includeUnpublished ? 'all' : 'published'}`,
    () => $fetch<Course[]>('/api/courses', { query: includeUnpublished ? { sort: 'title', order: 'asc' } : { status: 'published', sort: 'title', order: 'asc' } }),
    { server: false },
  )

  const courses = computed(() => data.value ?? [])
  const courseOptions = computed(() => courses.value.map(course => ({ value: course.slug, label: course.title })))

  return { courses, courseOptions, pending }
}
