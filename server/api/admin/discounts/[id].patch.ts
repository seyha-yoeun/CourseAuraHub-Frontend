import type { CourseDiscount, CourseDiscountUpdate } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Discount id is required' })
  }

  const body = await readBody<CourseDiscountUpdate>(event)

  return await backendRequest<CourseDiscount>(event, `/admin/discounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
    csrf: true,
    fallbackMessage: 'Unable to update discount',
  })
})
