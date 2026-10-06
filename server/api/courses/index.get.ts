import { readDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = await readDb()
  let courses = (db.courses || []) as Record<string, unknown>[]

  // Filter
  if (query.status && query.status !== 'all') {
    courses = courses.filter(c => c.status === query.status)
  }
  if (query.category && query.category !== 'all') {
    courses = courses.filter(c => c.category === query.category)
  }
  if (query.search) {
    const s = String(query.search).toLowerCase().trim()
    courses = courses.filter(c =>
      String(c.title || '').toLowerCase().includes(s) ||
      String(c.description || '').toLowerCase().includes(s) ||
      String(c.instructor || '').toLowerCase().includes(s)
    )
  }

  // Sort
  const sort = String(query.sort || 'createdAt')
  const order = String(query.order || 'desc')
  courses = [...courses].sort((a, b) => {
    const va = a[sort] as number | string | undefined
    const vb = b[sort] as number | string | undefined
    if (typeof va === 'string' && typeof vb === 'string') {
      return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    }
    const numA = Number(va) || 0
    const numB = Number(vb) || 0
    return order === 'asc' ? numA - numB : numB - numA
  })

  return courses
})
