export type ReferralStatus = 'signed_up' | 'qualified' | 'rewarded'

/** A friend who used my code, by first name only. */
export interface ReferredFriend {
  firstName: string
  status: ReferralStatus
  joinedAt: string
  rewardedAt: string | null
}

export interface MyReferral {
  code: string
  link: string
  rewardAmount: number
  currency: string
  signedUp: number
  qualified: number
  rewarded: number
  // Total credited to my member card for referrals
  earned: number
  friends: ReferredFriend[]
}

export interface AdminReferral {
  id: number
  referrerName: string | null
  referrerEmail: string | null
  refereeName: string | null
  refereeEmail: string | null
  status: ReferralStatus
  orderNumber: string | null
  rewardAmount: number | null
  createdAt: string
  qualifiedAt: string | null
  rewardedAt: string | null
}

export interface AdminReferralPage {
  items: AdminReferral[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
