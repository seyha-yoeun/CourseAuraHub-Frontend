import { readDb, writeDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name || !body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Name and email are required' })
  }

  const db = await readDb()
  const avatarSeed = encodeURIComponent(body.name.trim().replace(/\s+/g, ''))
  const newStudent = {
    id: Date.now(),
    name: body.name.trim(),
    email: body.email.trim(),
    avatar: body.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`,
    enrolledCourses: Array.isArray(body.enrolledCourses) ? body.enrolledCourses : [],
    totalSpent: Number(body.totalSpent) || 0,
    joinedAt: new Date().toISOString().split('T')[0],
    lastActive: new Date().toISOString().split('T')[0],
    status: body.status || 'active',
    completedCourses: [],
    country: body.country || 'Global',
  }

  if (!Array.isArray(db.students)) {
    db.students = []
  }

  db.students.unshift(newStudent)
  await writeDb(db)

  return newStudent
})
