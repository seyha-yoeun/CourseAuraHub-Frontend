import type { DashboardStats } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<DashboardStats>(event, '/stats', {
    fallbackMessage: 'Unable to load dashboard statistics',
  })
})
