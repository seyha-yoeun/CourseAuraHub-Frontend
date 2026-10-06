import { readDb } from '../utils/db'

export default defineEventHandler(async () => {
  const db = await readDb()
  return db.settings || {}
})
