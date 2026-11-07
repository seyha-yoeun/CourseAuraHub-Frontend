import type { AdminRefundRequestPage, RefundEligibility, RefundRequest } from '~/types/refund'

/** Learners ask for their money back; admins approve or decline. Some orders refund automatically. */
export function useRefunds() {
  async function fetchEligibility(orderNumber: string) {
    return await $fetch<RefundEligibility>(`/api/me/orders/${encodeURIComponent(orderNumber)}/refund-eligibility`)
  }

  async function requestRefund(orderNumber: string, reason: string) {
    return await $fetch<RefundRequest>(`/api/me/orders/${encodeURIComponent(orderNumber)}/refund-request`, {
      method: 'POST',
      body: { reason },
    })
  }

  async function fetchMine() {
    return await $fetch<RefundRequest[]>('/api/me/refund-requests')
  }

  async function fetchForAdmin(status: string, page: number, size = 20) {
    return await $fetch<AdminRefundRequestPage>('/api/admin/refund-requests', { query: { status, page, size } })
  }

  async function approve(id: number, note?: string) {
    return await $fetch<RefundRequest>(`/api/admin/refund-requests/${id}/approve`, { method: 'POST', body: { note: note || null } })
  }

  async function reject(id: number, note: string) {
    return await $fetch<RefundRequest>(`/api/admin/refund-requests/${id}/reject`, { method: 'POST', body: { note } })
  }

  return { fetchEligibility, requestRefund, fetchMine, fetchForAdmin, approve, reject }
}
