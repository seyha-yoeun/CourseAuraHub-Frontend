import type { Course, CourseFormData } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Course slug is required' })
  }

  const body = await readBody<Partial<CourseFormData>>(event)

  return await backendRequest<Course>(event, `/courses/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: {
      title: body?.title,
      description: body?.description,
      instructor: body?.instructor,
      price: body?.price,
      originalPrice: body?.originalPrice,
      status: body?.status,
      category: body?.category,
      level: body?.level,
      thumbnail: body?.thumbnail,
      totalLessons: body?.totalLessons,
      totalHours: body?.totalHours,
      tags: body?.tags,
    },
    csrf: true,
    fallbackMessage: 'Unable to update course',
  })
})
