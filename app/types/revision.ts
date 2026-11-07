export type RevisionStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface RevisionChange {
  field: string
  before: unknown
  after: unknown
}

/** Edits to a published course, held back until an admin approves them. */
export interface CourseRevision {
  id: number
  courseSlug: string
  courseTitle: string
  status: RevisionStatus
  // The instructor's note on what changed
  summary: string | null
  changes: RevisionChange[]
  reviewNote: string | null
  createdAt: string
  updatedAt: string
  reviewedAt: string | null
}

/** An approved change, as learners see it. */
export interface ChangelogEntry {
  date: string
  fields: string[]
  summary: string | null
}
