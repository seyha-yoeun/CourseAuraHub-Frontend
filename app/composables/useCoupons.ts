import type { Coupon, CouponCreate, CouponPreview, CouponUpdate } from '~/types'

export function useCoupons() {
  async function previewCoupon(courseSlug: string, code: string) {
    return await $fetch<CouponPreview>('/api/me/coupons/preview', { method: 'POST', body: { courseSlug, code } })
  }

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
    previewCoupon,
    fetchCoupons,
    createCoupon,
    updateCoupon,
  }
}
