import type { AuditPage, AuditQuery } from '~/types/audit'

/** The admin audit log: every create, update and delete by an admin or instructor. */
export function useAuditLog() {
  async function fetchAuditLog(query: AuditQuery) {
    return await $fetch<AuditPage>('/api/admin/audit-log', { query })
  }

  return { fetchAuditLog }
}
