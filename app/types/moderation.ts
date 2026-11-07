export type ReportTargetType = 'review' | 'question' | 'answer'

/** A learner's report on a review, question or answer, waiting for an admin. */
export interface ContentReport {
  id: number
  targetType: ReportTargetType
  targetId: number
  courseSlug: string | null
  // The start of the reported text
  excerpt: string | null
  author: string | null
  reason: string
  status: string
  // Open reports on the same content, this one included
  reportsOnTarget: number
  createdAt: string
}

export interface ContentReportPage {
  items: ContentReport[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
