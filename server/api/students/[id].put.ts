import { readDb, writeDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = await readDb()

  const idx = (db.students as Record<string, unknown>[]).findIndex(s => s.id === id)
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Student not found' })
  }

  const existing = db.students[idx]
  const updated = {
    ...existing,
    ...body,
    lastActive: new Date().toISOString().split('T')[0],
  }

  db.students[idx] = updated
  await writeDb(db)

  return updated
})
