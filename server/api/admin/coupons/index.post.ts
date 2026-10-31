import type { Coupon, CouponCreate } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CouponCreate>(event)

  return await backendRequest<Coupon>(event, '/admin/coupons', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to create coupon',
  })
})
