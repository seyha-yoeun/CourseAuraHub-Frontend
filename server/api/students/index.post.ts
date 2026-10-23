import type { Student } from '~/types'

interface StudentCreateBody {
  name?: string
  email?: string
  avatar?: string
  country?: string
  status?: Student['status']
}

export default defineEventHandler(async (event) => {
  const body = await readBody<StudentCreateBody>(event)

  return await backendRequest<Student>(event, '/students', {
    method: 'POST',
    body: {
      name: body?.name,
      email: body?.email,
      avatar: body?.avatar,
      country: body?.country,
      status: body?.status,
    },
    csrf: true,
    fallbackMessage: 'Unable to create student',
  })
})
