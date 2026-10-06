import { readDb, writeDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)
  const db = await readDb()

  const idx = (db.courses as Record<string, unknown>[]).findIndex(c => c.slug === slug)
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Course not found' })
  }

  const existing = db.courses[idx]
  const updated = {
    ...existing,
    ...body,
    tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map((t: string) => t.trim()) : existing.tags),
    price: body.price !== undefined ? Number(body.price) : existing.price,
    originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : existing.originalPrice,
    totalLessons: body.totalLessons !== undefined ? Number(body.totalLessons) : existing.totalLessons,
    totalHours: body.totalHours !== undefined ? Number(body.totalHours) : existing.totalHours,
    updatedAt: new Date().toISOString().split('T')[0],
  }

  db.courses[idx] = updated
  await writeDb(db)

  return updated
})
