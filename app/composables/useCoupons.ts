import type { Coupon, CouponCreate, CouponUpdate } from '~/types'

export function useCoupons() {
  async function fetchCoupons() {
    return await $fetch<Coupon[]>('/api/admin/coupons')
  }

  async function createCoupon(data: CouponCreate) {
    return await $fetch<Coupon>('/api/admin/coupons', { method: 'POST', body: data })
  }

  async function updateCoupon(id: number, data: CouponUpdate) {
    return await $fetch<Coupon>(`/api/admin/coupons/${id}`, { method: 'PATCH', body: data })
  }

  return {
    fetchCoupons,
    createCoupon,
    updateCoupon,
  }
}
