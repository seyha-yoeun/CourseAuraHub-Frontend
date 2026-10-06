import { readDb, writeDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = await readDb()

  const idx = (db.students as Record<string, unknown>[]).findIndex(s => s.id === id)
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Student not found' })
  }

  const deleted = db.students.splice(idx, 1)[0]
  await writeDb(db)

  return { success: true, deleted }
})
