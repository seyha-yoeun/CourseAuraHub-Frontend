import type { CheckoutResult } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ couponCode?: string }>(event)

  return await backendRequest<CheckoutResult>(event, '/me/cart/checkout', {
    method: 'POST',
    body: { couponCode: body?.couponCode },
    csrf: true,
    fallbackMessage: 'Unable to start checkout',
  })
})
