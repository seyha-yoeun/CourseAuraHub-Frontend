import type { Announcement, AnnouncementForm, AnnouncementPage } from '~/types/announcement'

/** Messages from course staff to everyone enrolled. Sending one also notifies each learner. */
export function useAnnouncements() {
  async function fetchForStaff(slug: string, page = 0, size = 20) {
    return await $fetch<AnnouncementPage>(`/api/instructor/courses/${slug}/announcements`, { query: { page, size } })
  }

  async function send(slug: string, data: AnnouncementForm) {
    return await $fetch<Announcement>(`/api/instructor/courses/${slug}/announcements`, { method: 'POST', body: data })
  }

  async function remove(slug: string, id: number) {
    return await $fetch(`/api/instructor/courses/${slug}/announcements/${id}`, { method: 'DELETE' })
  }

  async function fetchForLearner(slug: string, page = 0, size = 20) {
    return await $fetch<AnnouncementPage>(`/api/me/courses/${slug}/announcements`, { query: { page, size } })
  }

  return { fetchForStaff, send, remove, fetchForLearner }
}
