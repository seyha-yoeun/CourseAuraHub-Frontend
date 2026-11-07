import { downloadFile, today } from '~/utils/download'

export type AdminExport = 'orders' | 'enrollments' | 'learners' | 'member-card-ledger' | 'audit-log'
export type CourseExport = 'learners' | 'grades'

/** CSV downloads: platform-wide ones for admins, per-course ones for the course's staff. */
export function useExports() {
  async function downloadExport(name: AdminExport, range: { from?: string, to?: string, status?: string } = {}) {
    await downloadFile(`/api/admin/exports/${name}`, `${name}-${today()}.csv`, {
      from: range.from || undefined,
      to: range.to || undefined,
      status: range.status || undefined,
    })
  }

  async function downloadCourseExport(slug: string, name: CourseExport) {
    await downloadFile(`/api/instructor/courses/${slug}/exports/${name}`, `${slug}-${name}-${today()}.csv`)
  }

  return { downloadExport, downloadCourseExport }
}
