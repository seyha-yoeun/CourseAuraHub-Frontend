import type { CourseDiscount, CourseDiscountCreate } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CourseDiscountCreate>(event)

  return await backendRequest<CourseDiscount>(event, '/admin/discounts', {
    method: 'POST',
    body,
    csrf: true,
    fallbackMessage: 'Unable to create discount',
  })
})
