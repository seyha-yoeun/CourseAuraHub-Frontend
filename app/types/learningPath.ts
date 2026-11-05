import type { Course } from '~/types'

export type LearningPathStatus = 'draft' | 'published'

export interface LearningPath {
  id: number
  slug: string
  title: string
  description: string
  thumbnail: string | null
  status: LearningPathStatus
  courseCount: number
  totalLessons: number
  totalHours: number
  // What the courses cost together right now, after running sales
  price: number
  courses: Course[]
  updatedAt: string
}

export interface LearningPathForm {
  title?: string
  description?: string
  thumbnail?: string
  status?: LearningPathStatus
  // The path's courses in order; replaces the current list
  courseSlugs?: string[]
}

export interface LearningPathProgress {
  slug: string
  title: string
  totalCourses: number
  enrolledCourses: number
  completedCourses: number
  percent: number
  completed: boolean
  nextCourseSlug: string | null
  certificate: { certificateNumber: string, issuedAt: string } | null
  courses: { slug: string, title: string, thumbnail: string, enrolled: boolean, completed: boolean }[]
}

/** Free courses get enrolled; paid ones go to the cart for checkout. Values are course slugs. */
export interface LearningPathEnrollResult {
  enrolled: string[]
  addedToCart: string[]
  alreadyEnrolled: string[]
}
