import type { StoredFile } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  return await backendRequest<StoredFile>(event, `/me/files/${encodeURIComponent(id ?? '')}/complete`, {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to finish the upload',
  })
})
