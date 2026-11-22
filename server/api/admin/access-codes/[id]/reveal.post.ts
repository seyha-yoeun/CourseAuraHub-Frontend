import type { RevealedAccessCode } from '~/types/gift'

/** The full access code, for admins. A POST so the backend audit log records every reveal. */
export default defineEventHandler(async (event) => {
  const id = encodeURIComponent(getRouterParam(event, 'id') ?? '')

  // Never let a browser or proxy keep a copy of the code
  setResponseHeader(event, 'Cache-Control', 'no-store')

  return await backendRequest<RevealedAccessCode>(event, `/admin/access-codes/${id}/reveal`, {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to show the full code',
  })
})
