/** A course to finish before another. A hard one blocks enrolling; a soft one is a recommendation. */
export interface CoursePrerequisite {
  courseSlug: string
  courseTitle: string
  hard: boolean
  // Whether the caller completed it; null for visitors
  completed: boolean | null
}

export interface CourseRequirements {
  // False while a hard prerequisite is unfinished
  canEnroll: boolean
  prerequisites: CoursePrerequisite[]
}

export interface PrerequisiteInput {
  courseSlug: string
  hard: boolean
}
