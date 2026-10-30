import type { AdminOrderPage, Order } from '~/types'

/** Learner checkout and order history, plus the admin order list. */
export function useOrders() {
  async function createOrder(courseSlug: string, couponCode?: string) {
    return await $fetch<Order>('/api/me/orders', { method: 'POST', body: { courseSlug, couponCode } })
  }

  async function fetchMyOrders() {
    return await $fetch<Order[]>('/api/me/orders')
  }

  async function fetchMyOrder(orderNumber: string) {
    return await $fetch<Order>(`/api/me/orders/${encodeURIComponent(orderNumber)}`)
  }

  async function cancelOrder(orderNumber: string) {
    return await $fetch<Order>(`/api/me/orders/${encodeURIComponent(orderNumber)}/cancel`, { method: 'POST' })
  }

  async function fetchAdminOrders(status: string, page: number, size = 20) {
    return await $fetch<AdminOrderPage>('/api/admin/orders', { query: { status, page: String(page), size: String(size) } })
  }

  async function refundOrder(orderNumber: string) {
    return await $fetch<Order>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/refund`, { method: 'POST' })
  }

  return {
    createOrder,
    fetchMyOrders,
    fetchMyOrder,
    cancelOrder,
    fetchAdminOrders,
    refundOrder,
  }
}
