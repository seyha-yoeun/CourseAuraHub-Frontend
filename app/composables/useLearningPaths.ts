import type {
  LearningPath,
  LearningPathEnrollResult,
  LearningPathForm,
  LearningPathProgress
} from '~/types/learningPath'

/** Learning paths: the public catalog, a learner's progress and path certificates, and admin management. */
export function useLearningPaths() {
  const { locale } = useT()

  async function fetchPaths() {
    return await $fetch<LearningPath[]>('/api/learning-paths')
  }

  async function fetchPath(slug: string) {
    return await $fetch<LearningPath>(`/api/learning-paths/${slug}`)
  }

  async function fetchMyPaths() {
    return await $fetch<LearningPathProgress[]>('/api/me/learning-paths')
  }

  async function fetchProgress(slug: string) {
    return await $fetch<LearningPathProgress>(`/api/me/learning-paths/${slug}/progress`)
  }

  async function enrollInPath(slug: string) {
    return await $fetch<LearningPathEnrollResult>(`/api/me/learning-paths/${slug}/enroll`, { method: 'POST' })
  }

  async function downloadPathCertificate(certificateNumber: string) {
    const pdf = await $fetch<Blob>(`/api/me/learning-paths/certificates/${encodeURIComponent(certificateNumber)}/pdf`, {
      query: { lang: locale.value },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(pdf)
    const link = document.createElement('a')
    link.href = url
    link.download = `path-certificate-${certificateNumber}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function fetchAllForAdmin() {
    return await $fetch<LearningPath[]>('/api/admin/learning-paths')
  }

  async function createPath(data: LearningPathForm) {
    return await $fetch<LearningPath>('/api/admin/learning-paths', { method: 'POST', body: data })
  }

  async function updatePath(slug: string, data: LearningPathForm) {
    return await $fetch<LearningPath>(`/api/admin/learning-paths/${slug}`, { method: 'PUT', body: data })
  }

  async function deletePath(slug: string) {
    return await $fetch(`/api/admin/learning-paths/${slug}`, { method: 'DELETE' })
  }

  return {
    fetchPaths,
    fetchPath,
    fetchMyPaths,
    fetchProgress,
    enrollInPath,
    downloadPathCertificate,
    fetchAllForAdmin,
    createPath,
    updatePath,
    deletePath
  }
}
