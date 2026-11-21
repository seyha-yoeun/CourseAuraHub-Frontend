import type { LearnerLiveSession, LiveSessionForm, ManagedLiveSession } from '~/types/live'

/** Scheduled live classes: course staff schedule them, enrolled learners join and add them to a calendar. */
export function useLiveSessions() {
  function managePath(slug: string) {
    return `/api/instructor/courses/${encodeURIComponent(slug)}/live-sessions`
  }

  async function fetchForCourse(slug: string) {
    return await $fetch<ManagedLiveSession[]>(managePath(slug))
  }

  async function schedule(slug: string, body: LiveSessionForm) {
    return await $fetch<ManagedLiveSession>(managePath(slug), { method: 'POST', body })
  }

  async function update(slug: string, id: number, body: LiveSessionForm) {
    return await $fetch<ManagedLiveSession>(`${managePath(slug)}/${id}`, { method: 'PUT', body })
  }

  async function cancelSession(slug: string, id: number) {
    return await $fetch<ManagedLiveSession>(`${managePath(slug)}/${id}`, { method: 'DELETE' })
  }

  /** Sessions in my courses that haven't ended, plus the last week's. */
  async function fetchMine() {
    return await $fetch<LearnerLiveSession[]>('/api/me/live-sessions')
  }

  async function join(id: number) {
    return await $fetch<{ meetingUrl: string }>(`/api/me/live-sessions/${id}/join`, { method: 'POST' })
  }

  /** A private ICS link for calendar apps; asking again replaces the old link. */
  async function createCalendarFeed() {
    return await $fetch<{ feedUrl: string }>('/api/me/calendar-token', { method: 'POST' })
  }

  return { fetchForCourse, schedule, update, cancelSession, fetchMine, join, createCalendarFeed }
}

/** Upcoming first, then the ones that already ended, most recent first. */
export function sortSessions<T extends { startsAt: string, endsAt: string }>(sessions: T[]) {
  const now = Date.now()
  const upcoming = sessions.filter(s => new Date(s.endsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  const past = sessions.filter(s => new Date(s.endsAt).getTime() < now)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
  return { upcoming, past }
}
