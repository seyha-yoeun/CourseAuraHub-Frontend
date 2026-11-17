import type { PaymentMethod } from '~/types'

export type AccessCodeStatus = 'active' | 'awaiting_payment' | 'redeemed' | 'used_up' | 'revoked' | 'expired'

/** A code that unlocks one course. The full code is only shown once, when it is issued. */
export interface AccessCode {
  id: number
  // The last characters, to tell codes apart
  hint: string
  courseSlug: string
  courseTitle: string
  batch: string | null
  uses: number
  maxUses: number
  expiresAt: string | null
  revoked: boolean
  status: AccessCodeStatus
  createdAt: string
}

export interface AccessCodeIssue {
  courseSlug: string
  quantity: number
  maxUses?: number | null
  expiresAt?: string | null
  batch?: string | null
}

export interface IssuedAccessCodes {
  batch: string
  courseSlug: string
  codes: string[]
}

export interface SentGift {
  codeId: number
  recipientEmail: string
  courseSlug: string
  courseTitle: string
  status: AccessCodeStatus
  sentAt: string
}

export interface GiftRequest {
  courseSlug: string
  recipientEmail: string
  message?: string
  paymentMethod?: PaymentMethod
}

export interface RedeemedCode {
  courseSlug: string
  courseTitle: string
}
