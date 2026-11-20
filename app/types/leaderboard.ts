export type LeaderboardScope = 'week' | 'month'

/** A ranking entry: a shortened name and avatar only, never contact details. */
export interface LeaderboardEntry {
  rank: number
  displayName: string
  avatar: string | null
  xp: number
  lessonsCompleted: number
  you: boolean
}

export interface Leaderboard {
  scope: LeaderboardScope
  courseSlug: string | null
  from: string
  entries: LeaderboardEntry[]
  // The caller's own place; null without XP yet or when hidden from leaderboards
  me: LeaderboardEntry | null
  visible: boolean
}

export interface WeeklyGoal {
  weeklyLessonsTarget: number | null
  lessonsThisWeek: number
  // Lessons this week against the target, capped at 100; 0 without a target
  progressPercent: number
  achieved: boolean
  weekStartsAt: string
  leaderboardVisible: boolean
}
