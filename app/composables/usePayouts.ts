import type {
  AdminPayoutPage,
  EarningStatus,
  EarningsPage,
  Payout,
  PayoutRequestForm,
  PayoutStatus,
  RevenueShare,
} from '~/types/payout'

/** Instructor earnings from course sales, the payouts that pay them, and each course's revenue share. */
export function usePayouts() {
  async function fetchEarnings(status: EarningStatus | 'all', page: number, size = 20) {
    return await $fetch<EarningsPage>('/api/instructor/earnings', { query: { status, page, size } })
  }

  async function fetchMyPayouts() {
    return await $fetch<Payout[]>('/api/instructor/payouts')
  }

  async function requestPayout(body: PayoutRequestForm) {
    return await $fetch<Payout>('/api/instructor/payouts', { method: 'POST', body })
  }

  async function fetchPayoutRequests(status: PayoutStatus | 'all', page: number, size = 20) {
    return await $fetch<AdminPayoutPage>('/api/admin/payouts', { query: { status, page, size } })
  }

  async function approvePayout(id: number, note?: string) {
    return await $fetch<Payout>(`/api/admin/payouts/${id}/approve`, { method: 'POST', body: { note: note || null } })
  }

  async function rejectPayout(id: number, note: string) {
    return await $fetch<Payout>(`/api/admin/payouts/${id}/reject`, { method: 'POST', body: { note } })
  }

  async function markPayoutPaid(id: number, paymentReference?: string, note?: string) {
    return await $fetch<Payout>(`/api/admin/payouts/${id}/mark-paid`, {
      method: 'POST',
      body: { paymentReference: paymentReference || null, note: note || null },
    })
  }

  async function fetchRevenueShare(slug: string) {
    return await $fetch<RevenueShare>(`/api/admin/courses/${encodeURIComponent(slug)}/revenue-share`)
  }

  /** A null percent goes back to the platform default. Only future sales use it. */
  async function saveRevenueShare(slug: string, instructorPercent: number | null) {
    return await $fetch<RevenueShare>(`/api/admin/courses/${encodeURIComponent(slug)}/revenue-share`, {
      method: 'PUT',
      body: { instructorPercent },
    })
  }

  return {
    fetchEarnings,
    fetchMyPayouts,
    requestPayout,
    fetchPayoutRequests,
    approvePayout,
    rejectPayout,
    markPayoutPaid,
    fetchRevenueShare,
    saveRevenueShare,
  }
}

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  requested: 'Requested',
  approved: 'Approved',
  rejected: 'Declined',
  paid: 'Paid',
}

export const PAYOUT_STATUS_CLASSES: Record<PayoutStatus, string> = {
  requested: 'border-amber-400/30 bg-amber-400/12 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700',
  approved: 'border-blue-400/30 bg-blue-400/12 text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-700',
  rejected: 'border-rose-400/30 bg-rose-400/12 text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700',
  paid: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700',
}

export const EARNING_STATUS_LABELS: Record<EarningStatus, string> = {
  pending: 'On hold',
  available: 'Available',
  paid: 'Paid out',
  reversed: 'Refunded',
}

export const EARNING_STATUS_CLASSES: Record<EarningStatus, string> = {
  pending: 'border-amber-400/30 bg-amber-400/12 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700',
  available: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700',
  paid: 'border-blue-400/30 bg-blue-400/12 text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-700',
  reversed: 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600',
}
