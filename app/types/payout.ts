export type EarningStatus = 'pending' | 'available' | 'paid' | 'reversed'
export type EarningType = 'sale' | 'refund'
export type PayoutStatus = 'requested' | 'approved' | 'rejected' | 'paid'

/** One sale (or refund) on a course the instructor owns. Learners are never identified. */
export interface Earning {
  id: number
  orderNumber: string
  courseSlug: string
  courseTitle: string
  type: EarningType
  gross: number
  platformFee: number
  net: number
  sharePercent: number
  currency: string
  status: EarningStatus
  availableAt: string | null
  payoutId: number | null
  createdAt: string
}

export interface EarningsSummary {
  currency: string
  // Sales still inside the hold
  pending: number
  // Money that can be requested now
  available: number
  // Claimed by a payout that hasn't been paid yet
  inPayout: number
  paidOut: number
  minimumPayout: number
  // Whether a payout request would be accepted right now
  canRequest: boolean
}

export interface EarningsPage {
  summary: EarningsSummary
  items: Earning[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface Payout {
  id: number
  amount: number
  currency: string
  method: string
  accountDetails: string
  note: string | null
  status: PayoutStatus
  decisionNote: string | null
  paymentReference: string | null
  createdAt: string
  reviewedAt: string | null
  paidAt: string | null
}

export interface PayoutRequestForm {
  method: string
  accountDetails: string
  note: string | null
}

/** Admin view: who is asking, never a learner. */
export interface AdminPayout {
  payout: Payout
  instructorId: string
  instructorName: string
  instructorEmail: string
  earnings: number
}

export interface AdminPayoutPage {
  items: AdminPayout[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface RevenueShare {
  courseSlug: string
  instructorPercent: number
  // Whether the course has its own share instead of the platform default
  custom: boolean
  platformDefaultPercent: number
}
