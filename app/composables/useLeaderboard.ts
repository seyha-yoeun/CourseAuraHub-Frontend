import type { Leaderboard, LeaderboardScope, WeeklyGoal } from '~/types/leaderboard'

// Weeks start on Monday in the learner's own time zone
function timeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

/** XP leaderboards and weekly learning goals. */
export function useLeaderboard() {
  async function fetchLeaderboard(scope: LeaderboardScope, course?: string | null, limit = 20) {
    return await $fetch<Leaderboard>('/api/leaderboard', { query: { scope, course: course || undefined, limit } })
  }

  async function fetchGoal() {
    return await $fetch<WeeklyGoal>('/api/me/goals', { query: { timeZone: timeZone() } })
  }

  /** A null target clears the goal; leaving visibility out keeps it as it is. */
  async function saveGoal(body: { weeklyLessonsTarget: number | null, leaderboardVisible?: boolean }) {
    return await $fetch<WeeklyGoal>('/api/me/goals', { method: 'PUT', body, query: { timeZone: timeZone() } })
  }

  return { fetchLeaderboard, fetchGoal, saveGoal }
}
