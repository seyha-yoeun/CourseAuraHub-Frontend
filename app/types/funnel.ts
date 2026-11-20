export type CatalogEvent = 'view' | 'add_to_cart' | 'checkout_start'

export interface FunnelStep {
  key: string
  label: string
  count: number
  // Share of the previous step that reached this one, in percent; null for the first step
  fromPrevious: number | null
  // Share of the first step, in percent
  fromFirst: number | null
}

export interface EnrollmentFunnel {
  from: string
  to: string
  courseSlug: string | null
  steps: FunnelStep[]
}

export interface CohortMonth {
  // Months after joining; 0 is the joining month
  offset: number
  active: number
  rate: number | null
}

export interface RetentionCohort {
  month: string
  learners: number
  months: CohortMonth[]
}

export interface Retention {
  months: number
  cohorts: RetentionCohort[]
}
