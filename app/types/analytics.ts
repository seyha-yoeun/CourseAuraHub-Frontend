/** Aggregates for one course from GET /instructor/courses/{slug}/analytics. Never contains learner identities. */
export interface CourseAnalytics {
  slug: string
  title: string
  learners: { enrolled: number, completed: number, completionRate: number }
  reviews: { count: number, averageRating: number, distribution: Record<string, number> }
  assignments: { pendingReview: number, graded: number, averageScore: number | null }
  monthly: { month: number, enrollments: number, revenue: number }[]
  lessons: LessonFunnel[]
}

export interface LessonFunnel {
  lessonId: number
  section: string
  title: string
  type: 'video' | 'article' | 'quiz'
  completedLearners: number
  completionRate: number
  // Percentage points fewer learners than the lesson before
  dropOff: number
  video: { learnersWatching: number, averageWatchSeconds: number | null } | null
  quiz: {
    attempts: number
    learners: number
    passRate: number
    averageScore: number | null
    averageAttemptsPerLearner: number
  } | null
}
