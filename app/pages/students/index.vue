<template>
  <div class="students-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Student Management</h1>
        <p class="page-sub">
          Monitor learner progress, lifetime value, and global enrollment distribution.
        </p>
      </div>

      <button
        type="button"
        class="refresh-btn"
        :disabled="isRefreshing"
        @click="handleRefresh"
      >
        <RefreshCw :size="15" :class="{ 'animate-spin': isRefreshing }" />
        <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}</span>
      </button>
    </div>

    <!-- Student Stats -->
    <div class="stats-row">
      <StatCard
        label="Total Learners"
        :value="students.length"
        format="number"
        sub="Registered academy accounts"
        :icon="Users"
        accent-color="#3b82f6"
      />
      <StatCard
        label="Active Students"
        :value="activeStudentsCount"
        format="number"
        sub="Active in last 30 days"
        :icon="UserCheck"
        accent-color="#10b981"
      />
      <StatCard
        label="Total Lifetime Spend"
        :value="totalSpent"
        format="currency"
        sub="Cumulative student purchases"
        :icon="DollarSign"
        accent-color="#8b5cf6"
      />
      <StatCard
        label="Average Enrolled"
        :value="avgCourses"
        sub="Courses per registered student"
        :icon="GraduationCap"
        accent-color="#f59e0b"
      />
    </div>

    <!-- Student Table -->
    <div v-if="pending" class="shimmer skeleton-table"></div>
    <StudentTable v-else :students="students" />
  </div>
</template>

<script setup lang="ts">
import { Users, UserCheck, DollarSign, GraduationCap, RefreshCw } from 'lucide-vue-next'
import type { Student } from '~/types'
import StatCard from '~/components/shared/StatCard.vue'
import StudentTable from '~/components/students/StudentTable.vue'
import { useAppToast } from '~/composables/useAppToast'

definePageMeta({ requiresAdmin: true })

useHead({
  title: 'Student Management'
})

const { info, error } = useAppToast()
const isRefreshing = ref(false)
const { data, pending, refresh } = await useAsyncData<Student[]>('students-list', () =>
  $fetch(`/api/students?_t=${Date.now()}`)
)

async function handleRefresh() {
  isRefreshing.value = true
  try {
    await refresh()
    info('Students Synced', `${students.value.length} learner records synced from server.`)
  } catch (err: unknown) {
    error('Refresh Failed', (err as Error).message || 'Could not refresh student data')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 600)
  }
}

const students = computed(() => data.value || [])

const activeStudentsCount = computed(() =>
  students.value.filter(s => s.status === 'active').length
)

const totalSpent = computed(() =>
  students.value.reduce((sum, s) => sum + (s.totalSpent || 0), 0)
)

const avgCourses = computed(() => {
  if (!students.value.length) return '0.0'
  const total = students.value.reduce((sum, s) => sum + (s.enrolledCourses ? s.enrolledCourses.length : 0), 0)
  return (total / students.value.length).toFixed(1)
})
</script>

<style scoped>
.students-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.5px;
}

.page-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 4px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.skeleton-table {
  width: 100%;
  height: 400px;
  border-radius: 18px;
}
</style>
