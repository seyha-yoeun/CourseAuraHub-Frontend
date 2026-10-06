import { readDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = await readDb()
  let students = (db.students || []) as Record<string, unknown>[]

  if (query.status && query.status !== 'all') {
    students = students.filter(s => s.status === query.status)
  }

  if (query.search) {
    const s = String(query.search).toLowerCase().trim()
    students = students.filter(student =>
      String(student.name || '').toLowerCase().includes(s) ||
      String(student.email || '').toLowerCase().includes(s) ||
      String(student.country || '').toLowerCase().includes(s)
    )
  }

  return students
})
