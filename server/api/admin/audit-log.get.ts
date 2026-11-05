import type { AuditPage } from '~/types/audit'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<AuditPage>(event, '/admin/audit-log', {
    query: {
      actor: queryString(query.actor),
      resource: queryString(query.resource),
      resourceId: queryString(query.resourceId),
      action: queryString(query.action),
      outcome: queryString(query.outcome),
      from: queryString(query.from),
      to: queryString(query.to),
      page: queryString(query.page),
      size: queryString(query.size),
    },
    fallbackMessage: 'Unable to load the audit log',
  })
})
