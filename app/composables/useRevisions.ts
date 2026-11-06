import type { ChangelogEntry, CourseRevision } from '~/types/revision'

/** Reviewed changes to published courses: the instructor's side, the admin review, and the public changelog. */
export function useRevisions() {
  async function fetchHistory(slug: string) {
    return await $fetch<CourseRevision[]>(`/api/instructor/courses/${slug}/revisions`)
  }

  async function updateSummary(slug: string, summary: string) {
    return await $fetch<CourseRevision>(`/api/instructor/courses/${slug}/revisions/pending`, { method: 'PATCH', body: { summary } })
  }

  async function withdraw(slug: string) {
    return await $fetch(`/api/instructor/courses/${slug}/revisions/pending`, { method: 'DELETE' })
  }

  async function fetchAwaitingReview() {
    return await $fetch<CourseRevision[]>('/api/admin/course-revisions')
  }

  async function approve(id: number, note?: string) {
    return await $fetch<CourseRevision>(`/api/admin/course-revisions/${id}/approve`, { method: 'POST', body: { note: note || null } })
  }

  async function reject(id: number, note: string) {
    return await $fetch<CourseRevision>(`/api/admin/course-revisions/${id}/reject`, { method: 'POST', body: { note } })
  }

  async function fetchChangelog(slug: string) {
    return await $fetch<ChangelogEntry[]>(`/api/courses/${slug}/changelog`)
  }

  return { fetchHistory, updateSummary, withdraw, fetchAwaitingReview, approve, reject, fetchChangelog }
}
