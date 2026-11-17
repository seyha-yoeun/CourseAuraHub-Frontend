import type {
  OrganizationDetail,
  OrganizationInvite,
  OrganizationMemberProgress,
  OrganizationRole,
  OrganizationSeat,
  OrganizationSummary,
} from '~/types/organization'

/** Team accounts: the admin creates them and sells seats, owners and managers run them. */
export function useOrganizations() {
  async function fetchMyOrganizations() {
    return await $fetch<OrganizationSummary[]>('/api/me/organizations')
  }

  async function fetchOrganization(slug: string) {
    return await $fetch<OrganizationDetail>(`/api/me/organizations/${encodeURIComponent(slug)}`)
  }

  async function inviteMember(slug: string, email: string, role: OrganizationRole) {
    return await $fetch<OrganizationInvite>(`/api/me/organizations/${encodeURIComponent(slug)}/invites`, {
      method: 'POST',
      body: { email, role },
    })
  }

  async function acceptInvite(token: string) {
    return await $fetch<OrganizationSummary>('/api/me/organization-invites/accept', { method: 'POST', body: { token } })
  }

  async function assignSeat(slug: string, courseSlug: string, userId: string) {
    return await $fetch<OrganizationSeat>(
      `/api/me/organizations/${encodeURIComponent(slug)}/seats/${encodeURIComponent(courseSlug)}/assignments`,
      { method: 'POST', body: { userId } },
    )
  }

  async function removeMember(slug: string, userId: string) {
    return await $fetch(`/api/me/organizations/${encodeURIComponent(slug)}/members/${encodeURIComponent(userId)}`, { method: 'DELETE' })
  }

  async function fetchMemberProgress(slug: string) {
    return await $fetch<OrganizationMemberProgress[]>(`/api/me/organizations/${encodeURIComponent(slug)}/progress`)
  }

  async function fetchAllOrganizations() {
    return await $fetch<OrganizationSummary[]>('/api/admin/organizations')
  }

  async function createOrganization(name: string, ownerEmail: string) {
    return await $fetch<OrganizationDetail>('/api/admin/organizations', { method: 'POST', body: { name, ownerEmail } })
  }

  async function setSeats(slug: string, courseSlug: string, total: number) {
    return await $fetch<OrganizationSeat>(`/api/admin/organizations/${encodeURIComponent(slug)}/seats`, {
      method: 'PUT',
      body: { courseSlug, total },
    })
  }

  return {
    fetchMyOrganizations,
    fetchOrganization,
    inviteMember,
    acceptInvite,
    assignSeat,
    removeMember,
    fetchMemberProgress,
    fetchAllOrganizations,
    createOrganization,
    setSeats,
  }
}
