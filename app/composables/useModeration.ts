import type { ContentReport, ContentReportPage, ReportTargetType } from '~/types/moderation'

/** Reporting reviews and discussion posts, and the admin queue that handles the reports. */
export function useModeration() {
  async function reportContent(targetType: ReportTargetType, targetId: number, reason: string) {
    return await $fetch('/api/me/reports', { method: 'POST', body: { targetType, targetId, reason } })
  }

  async function fetchOpenReports(page = 0, size = 20) {
    return await $fetch<ContentReportPage>('/api/admin/reports', { query: { page: String(page), size: String(size) } })
  }

  async function hideReported(id: number) {
    return await $fetch<ContentReport>(`/api/admin/reports/${id}/hide`, { method: 'POST' })
  }

  async function dismissReport(id: number) {
    return await $fetch<ContentReport>(`/api/admin/reports/${id}/dismiss`, { method: 'POST' })
  }

  return { reportContent, fetchOpenReports, hideReported, dismissReport }
}
