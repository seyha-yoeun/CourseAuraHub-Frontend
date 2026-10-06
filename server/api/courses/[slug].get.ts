import { readDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = await readDb()
  const course = (db.courses as Record<string, unknown>[]).find(c => c.slug === slug)

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Course not found' })
  }

  // Also attach enrolled students for this course
  const courseId = course.id as number
  const students = (db.students as Record<string, unknown>[] || []).filter(s =>
    Array.isArray(s.enrolledCourses) && s.enrolledCourses.includes(courseId)
  )

  return {
    ...course,
    enrolledStudentList: students
  }
})
