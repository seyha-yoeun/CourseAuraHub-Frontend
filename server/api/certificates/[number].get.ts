import type { CertificateVerification } from '~/types'

export default defineEventHandler(async (event) => {
  const number = getRouterParam(event, 'number')

  if (!number) {
    throw createError({ statusCode: 400, statusMessage: 'Certificate number is required' })
  }

  // Public verification: anyone holding the link can check it, signed in or not
  return await backendRequest<CertificateVerification>(event, `/certificates/${encodeURIComponent(number)}`, {
    auth: false,
    fallbackMessage: 'Certificate not found',
  })
})
