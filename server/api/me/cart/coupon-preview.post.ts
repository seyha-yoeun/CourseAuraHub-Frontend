import type { CartCouponPreview } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string }>(event)

  return await backendRequest<CartCouponPreview>(event, '/me/cart/coupon-preview', {
    method: 'POST',
    body: { code: body?.code },
    csrf: true,
    fallbackMessage: 'Unable to apply this coupon',
  })
})
