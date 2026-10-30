import type { Coupon } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<Coupon[]>(event, '/admin/coupons', {
    fallbackMessage: 'Unable to load coupons',
  })
})
