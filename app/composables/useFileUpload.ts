import type { FilePurpose, FileUploadTicket, StoredFile } from '~/types'

// fetch can't report upload progress, which matters for long videos
function putFile(ticket: FileUploadTicket, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', ticket.uploadUrl)
    request.setRequestHeader('Content-Type', ticket.contentType)
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => (request.status < 300 ? resolve() : reject(new Error('The file could not be uploaded')))
    request.onerror = () => reject(new Error('The file could not be uploaded'))
    request.send(file)
  })
}

export function useFileUpload() {
  async function upload(file: File, purpose: FilePurpose, onProgress: (percent: number) => void = () => {}) {
    const ticket = await $fetch<FileUploadTicket>('/api/me/files', {
      method: 'POST',
      body: { purpose, fileName: file.name, contentType: file.type, size: file.size },
    })
    await putFile(ticket, file, onProgress)
    return await $fetch<StoredFile>(`/api/me/files/${ticket.id}/complete`, { method: 'POST' })
  }

  return { upload }
}
