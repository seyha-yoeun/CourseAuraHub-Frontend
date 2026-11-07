export type RefundRequestStatus = 'pending' | 'approved' | 'rejected'

/** Whether an order can be refunded right now, and how. */
export interface RefundEligibility {
  canRequest: boolean
  // Refunded straight away, without an admin
  automatic: boolean
  progressPercent: number
  windowEndsAt: string | null
  // Why a refund can't be requested
  reasons: string[]
}

export interface RefundRequest {
  id: number
  orderNumber: string
  courseSlug: string
  courseTitle: string
  amount: number
  currency: string
  reason: string
  status: RefundRequestStatus
  autoApproved: boolean
  progressPercent: number
  decisionNote: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface AdminRefundRequest {
  request: RefundRequest
  studentName: string
  studentEmail: string
  provider: string | null
  paidAt: string | null
}

export interface AdminRefundRequestPage {
  items: AdminRefundRequest[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
