import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'

export async function readDb() {
  const dbPath = resolve(process.cwd(), 'server/data/db.json')
  const raw = await readFile(dbPath, 'utf-8')
  return JSON.parse(raw)
}

export async function writeDb(data: Record<string, unknown>) {
  const dbPath = resolve(process.cwd(), 'server/data/db.json')
  await writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8')
}
