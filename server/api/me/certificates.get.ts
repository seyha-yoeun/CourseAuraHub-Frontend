import type { Certificate } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<Certificate[]>(event, '/me/certificates', {
    fallbackMessage: 'Unable to load your certificates',
  })
})
