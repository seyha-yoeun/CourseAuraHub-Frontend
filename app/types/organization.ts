export type OrganizationRole = 'owner' | 'manager' | 'member'

/** A team account. Owners and managers invite people and hand out the course seats it bought. */
export interface OrganizationSummary {
  slug: string
  name: string
  // The caller's role; null in the admin list
  role: OrganizationRole | null
  members: number
}

export interface OrganizationSeat {
  courseSlug: string
  courseTitle: string
  total: number
  used: number
}

export interface OrganizationMember {
  userId: string
  name: string
  email: string
  role: OrganizationRole
  joinedAt: string
}

export interface OrganizationDetail {
  slug: string
  name: string
  role: OrganizationRole | null
  seats: OrganizationSeat[]
  members: OrganizationMember[]
}

export interface OrganizationInvite {
  id: number
  email: string
  role: OrganizationRole
  expiresAt: string
  // The link to share; it is also emailed to the invitee
  inviteUrl: string
}

export interface OrganizationCourseProgress {
  courseSlug: string
  courseTitle: string
  completedLessons: number
  totalLessons: number
  completed: boolean
  certificateNumber: string | null
}

export interface OrganizationMemberProgress {
  userId: string
  name: string
  role: OrganizationRole
  courses: OrganizationCourseProgress[]
}
