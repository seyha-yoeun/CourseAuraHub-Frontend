export type BillingInterval = 'month' | 'year'
export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired'
export type SubscriptionPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'
export type SubscriptionPaymentMethod = 'online' | 'member_card'

/** An all-access plan. Inactive plans are only listed for admins. */
export interface SubscriptionPlan {
  id: number
  code: string
  name: string
  description: string | null
  price: number
  currency: string
  billingInterval: BillingInterval
  active: boolean
}

export interface SubscriptionPlanForm {
  code: string
  name: string
  description: string | null
  price: number
  billingInterval: BillingInterval
  active: boolean
}

/** One billing period's payment. */
export interface SubscriptionPayment {
  paymentNumber: string
  amount: number
  currency: string
  status: SubscriptionPaymentStatus
  periodStart: string | null
  periodEnd: string | null
  checkoutUrl: string | null
  createdAt: string
  paidAt: string | null
}

/** The learner's latest subscription with its recent payments. */
export interface MySubscription {
  id: number
  plan: SubscriptionPlan
  status: SubscriptionStatus
  // Whether it currently lets the learner enroll in and study any course
  hasAccess: boolean
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  paymentMethod: SubscriptionPaymentMethod | null
  // Where to pay an open payment, if any
  checkoutUrl: string | null
  courses: number
  payments: SubscriptionPayment[]
}

export interface AdminSubscription {
  id: number
  studentId: number
  learnerName: string
  learnerEmail: string
  planCode: string
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
}

export interface AdminSubscriptionPage {
  items: AdminSubscription[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
