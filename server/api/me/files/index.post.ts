import type { FileUploadRequest, FileUploadTicket } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<FileUploadRequest>(event)

  return await backendRequest<FileUploadTicket>(event, '/me/files', {
    method: 'POST',
    body: {
      purpose: body?.purpose,
      fileName: body?.fileName,
      contentType: body?.contentType,
      size: body?.size,
    },
    csrf: true,
    fallbackMessage: 'Unable to start the upload',
  })
})
