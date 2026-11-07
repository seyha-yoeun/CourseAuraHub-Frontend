import type { MemberCard } from '~/types'

export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  return await backendRequest<MemberCard>(event, `/admin/member-cards/${id}`, {
    fallbackMessage: 'Unable to load this member card',
  })
})
