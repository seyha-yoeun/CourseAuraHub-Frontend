import { readDb, writeDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await readDb()
  db.settings = {
    ...db.settings,
    ...body,
  }
  await writeDb(db)
  return db.settings
})
