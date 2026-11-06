import type { Order } from '~/types'
import type { AccessCode, AccessCodeIssue, GiftRequest, IssuedAccessCodes, RedeemedCode, SentGift } from '~/types/gift'

/** Gifting a course, redeeming an access code, and the admin code batches. */
export function useGifts() {
  /** Starts a checkout like a purchase; the recipient gets their code once it is paid. */
  async function sendGift(data: GiftRequest) {
    return await $fetch<Order>('/api/me/gifts', { method: 'POST', body: data })
  }

  async function fetchSentGifts() {
    return await $fetch<SentGift[]>('/api/me/gifts')
  }

  async function redeemCode(code: string) {
    return await $fetch<RedeemedCode>('/api/me/access-codes/redeem', { method: 'POST', body: { code } })
  }

  async function fetchAccessCodes(batch?: string) {
    return await $fetch<AccessCode[]>('/api/admin/access-codes', { query: { batch: batch || undefined } })
  }

  async function issueAccessCodes(data: AccessCodeIssue) {
    return await $fetch<IssuedAccessCodes>('/api/admin/access-codes', { method: 'POST', body: data })
  }

  async function revokeAccessCode(id: number) {
    return await $fetch<AccessCode>(`/api/admin/access-codes/${id}`, { method: 'DELETE' })
  }

  return { sendGift, fetchSentGifts, redeemCode, fetchAccessCodes, issueAccessCodes, revokeAccessCode }
}

export const ACCESS_CODE_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  awaiting_payment: 'Awaiting payment',
  redeemed: 'Redeemed',
  used_up: 'Used up',
  revoked: 'Revoked',
  expired: 'Expired',
}
