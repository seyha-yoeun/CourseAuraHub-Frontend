import type { AdminOrderPage, CouponPreview, Order, PaymentMethod } from '~/types'
import { downloadFile } from '~/utils/download'

/** Learner checkout and order history, plus the admin order list. */
export function useOrders() {
  async function fetchMyOrders() {
    return await $fetch<Order[]>('/api/me/orders')
  }

  async function fetchMyOrder(orderNumber: string) {
    return await $fetch<Order>(`/api/me/orders/${encodeURIComponent(orderNumber)}`)
  }

  async function cancelOrder(orderNumber: string) {
    return await $fetch<Order>(`/api/me/orders/${encodeURIComponent(orderNumber)}/cancel`, { method: 'POST' })
  }

  // Buys one course on its own, leaving anything else in the cart alone
  async function checkoutCourse(courseSlug: string, couponCode?: string, paymentMethod?: PaymentMethod) {
    return await $fetch<Order>('/api/me/orders', { method: 'POST', body: { courseSlug, couponCode, paymentMethod } })
  }

  async function previewCourseCoupon(courseSlug: string, code: string) {
    return await $fetch<CouponPreview>('/api/me/coupons/preview', { method: 'POST', body: { courseSlug, code } })
  }

  async function fetchAdminOrders(status: string, page: number, size = 20) {
    return await $fetch<AdminOrderPage>('/api/admin/orders', { query: { status, page: String(page), size: String(size) } })
  }

  async function refundOrder(orderNumber: string) {
    return await $fetch<Order>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/refund`, { method: 'POST' })
  }

  /** PDF receipt for a paid or refunded order; admins can download anyone's. */
  async function downloadReceipt(orderNumber: string, asAdmin = false) {
    const base = asAdmin ? '/api/admin/orders' : '/api/me/orders'
    await downloadFile(`${base}/${encodeURIComponent(orderNumber)}/receipt`, `receipt-${orderNumber}.pdf`)
  }

  return {
    checkoutCourse, previewCourseCoupon, fetchMyOrders,
    fetchMyOrder,
    cancelOrder,
    fetchAdminOrders,
    refundOrder,
    downloadReceipt,
  }
}
