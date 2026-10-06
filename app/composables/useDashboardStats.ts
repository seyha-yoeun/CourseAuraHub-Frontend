import type { DashboardStats } from '~/types'

export function useDashboardStats() {
  const { data, pending, refresh, error } = useAsyncData<DashboardStats>('dashboard-stats', () =>
    $fetch('/api/stats')
  )

  const kpis = computed(() => data.value?.kpis ?? {
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    avgRating: 0,
    revenueGrowth: 0,
    studentGrowth: 0,
  })

  const charts = computed(() => data.value?.charts ?? {
    months: [],
    monthlyRevenue: [],
    monthlyEnrollments: [],
    revenueByCategory: {},
  })

  const topCourses = computed(() => data.value?.topCourses ?? [])
  const recentEnrollments = computed(() => data.value?.recentEnrollments ?? [])

  return { kpis, charts, topCourses, recentEnrollments, pending, refresh, error }
}
