import type { Course, CourseFormData } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CourseFormData>(event)

  return await backendRequest<Course>(event, '/courses', {
    method: 'POST',
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
    fallbackMessage: 'Unable to create course',
  })
})
