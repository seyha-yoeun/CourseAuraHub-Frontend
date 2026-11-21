import type { AdminReferralPage, MyReferral, ReferralStatus } from '~/types/referral'

const PENDING_KEY = 'pending-referral-code'

/** Referral codes: learners share theirs, new learners use one, and the referrer's member card is credited. */
export function useReferral() {
  async function fetchMine() {
    return await $fetch<MyReferral>('/api/me/referral')
  }

  async function claim(code: string) {
    return await $fetch<{ referrerFirstName: string | null }>('/api/me/referral/claim', { method: 'POST', body: { code: code.trim() } })
  }

  async function fetchForAdmin(status: ReferralStatus | 'all', page: number, size = 20) {
    return await $fetch<AdminReferralPage>('/api/admin/referrals', { query: { status, page, size } })
  }

  /** Keeps a code from a shared link (/auth/register?ref=CODE) until the visitor has an account. */
  function rememberCode(value: unknown) {
    const code = typeof value === 'string' ? value.trim().slice(0, 20) : ''
    if (!code || !import.meta.client) return null
    try {
      localStorage.setItem(PENDING_KEY, code)
    } catch {
      // Private browsing: the learner can still enter the code on the referrals page
    }
    return code
  }

  function pendingCode() {
    if (!import.meta.client) return null
    try {
      return localStorage.getItem(PENDING_KEY)
    } catch {
      return null
    }
  }

  /** Uses a remembered code once the visitor is signed in. It's forgotten either way, so a bad code isn't retried. */
  async function claimPending() {
    const code = pendingCode()
    if (!code) return null
    try {
      localStorage.removeItem(PENDING_KEY)
    } catch {
      // Nothing stored to clear
    }
    return await claim(code)
  }

  return { fetchMine, claim, fetchForAdmin, rememberCode, pendingCode, claimPending }
}

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  signed_up: 'Signed up',
  qualified: 'Bought a course',
  rewarded: 'Reward paid',
}
