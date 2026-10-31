import type { Coupon, CouponUpdate } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon id is required' })
  }

  const body = await readBody<CouponUpdate>(event)

  return await backendRequest<Coupon>(event, `/admin/coupons/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
    csrf: true,
    fallbackMessage: 'Unable to update coupon',
  })
})
