/** One write action by an admin or instructor. Request bodies are never recorded. */
export interface AuditEvent {
  id: number
  actorId: string | null
  actorEmail: string
  actorRole: 'ADMIN' | 'INSTRUCTOR'
  // Handler that ran, such as CouponController.update
  action: string
  httpMethod: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  pathPattern: string
  // What was changed, such as courses or coupons
  resource: string
  resourceId: string | null
  // Path variables as a JSON object string
  pathVariables: string | null
  status: number
  outcome: 'SUCCESS' | 'FAILURE'
  requestId: string | null
  ipAddress: string | null
  createdAt: string
}

export interface AuditPage {
  items: AuditEvent[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AuditQuery {
  actor?: string
  resource?: string
  resourceId?: string
  action?: string
  outcome?: string
  from?: string
  to?: string
  page?: number
  size?: number
}
