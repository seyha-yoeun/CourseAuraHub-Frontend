import type { CourseDiscount } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<CourseDiscount[]>(event, '/admin/discounts', {
    query: { courseSlug: queryString(query.courseSlug as string | undefined) },
    fallbackMessage: 'Unable to load discounts',
  })
})
