import { readDb, writeDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = await readDb()

  const idx = (db.courses as Record<string, unknown>[]).findIndex(c => c.slug === slug)
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Course not found' })
  }

  const deleted = db.courses.splice(idx, 1)[0]
  await writeDb(db)

  return { success: true, deleted }
})
