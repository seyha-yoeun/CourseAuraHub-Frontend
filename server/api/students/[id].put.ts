import type { Student } from '~/types'

interface StudentUpdateBody {
  name?: string
  email?: string
  avatar?: string
  country?: string
  status?: Student['status']
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Student id is required' })
  }

  const body = await readBody<StudentUpdateBody>(event)

  return await backendRequest<Student>(event, `/students/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: {
      name: body?.name,
      email: body?.email,
      avatar: body?.avatar,
      country: body?.country,
      status: body?.status,
    },
    csrf: true,
    fallbackMessage: 'Unable to update student',
  })
})
