import { readDb } from '../utils/db'

export default defineEventHandler(async () => {
  const db = await readDb()
  const courses = (db.courses || []) as Record<string, unknown>[]

  const totalRevenue = courses.reduce((s: number, c: Record<string, unknown>) => s + (Number(c.revenue) || 0), 0)
  const totalStudents = (db.students || []).length
  const totalCourses = courses.length
  const publishedCourses = courses.filter((c: Record<string, unknown>) => c.status === 'published').length
  const ratedCourses = courses.filter((c: Record<string, unknown>) => Number(c.rating) > 0)
  const avgRating = ratedCourses.length
    ? ratedCourses.reduce((s: number, c: Record<string, unknown>) => s + (Number(c.rating) || 0), 0) / ratedCourses.length
    : 0

  // Monthly aggregated data (last 12 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyRevenue = months.map((_, i) =>
    courses.reduce((s: number, c: Record<string, unknown>) => s + (Array.isArray(c.monthlyRevenue) ? (Number(c.monthlyRevenue[i]) || 0) : 0), 0)
  )
  const monthlyEnrollments = months.map((_, i) =>
    courses.reduce((s: number, c: Record<string, unknown>) => s + (Array.isArray(c.monthlyEnrollments) ? (Number(c.monthlyEnrollments[i]) || 0) : 0), 0)
  )

  // Revenue by category
  const revenueByCategory: Record<string, number> = {}
  for (const c of courses) {
    const cat = String(c.category || 'General')
    revenueByCategory[cat] = (revenueByCategory[cat] || 0) + (Number(c.revenue) || 0)
  }

  // Top courses
  const topCourses = [...courses]
    .sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0))
    .slice(0, 5)
    .map(c => ({
      slug: c.slug,
      title: c.title,
      revenue: c.revenue,
      totalStudents: c.totalStudents,
      rating: c.rating,
      category: c.category,
      price: c.price,
      status: c.status
    }))

  // Recent enrollments
  const enrollments = (db.enrollments || []) as Record<string, unknown>[]
  const students = (db.students || []) as Record<string, unknown>[]

  const recentEnrollments = enrollments
    .sort((a, b) => new Date(String(b.enrolledAt)).getTime() - new Date(String(a.enrolledAt)).getTime())
    .slice(0, 10)
    .map(e => {
      const student = students.find(s => s.id === e.studentId) as Record<string, unknown> | undefined
      const course = courses.find(c => c.id === e.courseId) as Record<string, unknown> | undefined
      return {
        id: e.id,
        studentName: student?.name || 'Anonymous Student',
        studentAvatar: student?.avatar || 'https://api.dicebear.com/9.x/avataaars/svg?seed=Student',
        studentCountry: student?.country || 'Global',
        courseTitle: course?.title || 'Unknown Course',
        courseSlug: course?.slug || '',
        amount: e.amount || 0,
        enrolledAt: e.enrolledAt,
      }
    })

  return {
    kpis: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalStudents,
      totalCourses,
      publishedCourses,
      avgRating: Math.round(avgRating * 10) / 10,
      revenueGrowth: 18.4,
      studentGrowth: 23.1,
    },
    charts: {
      months,
      monthlyRevenue,
      monthlyEnrollments,
      revenueByCategory,
    },
    topCourses,
    recentEnrollments,
  }
})
