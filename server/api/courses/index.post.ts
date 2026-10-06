import { readDb, writeDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const db = await readDb()
  const baseSlug = String(body.title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  let slug = baseSlug || `course-${Date.now()}`
  let counter = 1
  while ((db.courses as Record<string, unknown>[]).some(c => c.slug === slug)) {
    slug = `${baseSlug}-${counter++}`
  }

  const newCourse = {
    id: Date.now(),
    slug,
    title: body.title,
    description: body.description || '',
    instructor: body.instructor || 'Alex Chen',
    price: Number(body.price) || 0,
    originalPrice: Number(body.originalPrice) || Number(body.price) || 0,
    status: body.status || 'draft',
    category: body.category || 'Web Development',
    level: body.level || 'Beginner',
    thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
    rating: 0,
    totalStudents: 0,
    totalLessons: Number(body.totalLessons) || 0,
    totalHours: Number(body.totalHours) || 0,
    revenue: 0,
    completionRate: 0,
    tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map((t: string) => t.trim()) : []),
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    monthlyEnrollments: Array(12).fill(0),
    monthlyRevenue: Array(12).fill(0),
  }

  db.courses.unshift(newCourse)
  await writeDb(db)

  return newCourse
})
