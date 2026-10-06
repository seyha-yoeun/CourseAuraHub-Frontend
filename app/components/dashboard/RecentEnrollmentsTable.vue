<template>
  <div class="table-card glass">
    <div class="card-header">
      <div>
        <h3 class="card-title">{{ title || 'Recent Enrollments' }}</h3>
        <p class="card-sub">Real-time student transactions and course acquisitions</p>
      </div>
      <NuxtLink to="/students" class="view-all-link">
        <span>View Students</span>
        <ArrowUpRight :size="14" />
      </NuxtLink>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Country</th>
            <th>Amount</th>
            <th>Enrolled Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!enrollments || enrollments.length === 0">
            <td colspan="5" class="empty-state">
              No recent enrollments recorded yet.
            </td>
          </tr>
          <tr
            v-for="item in enrollments"
            :key="item.id"
            class="table-row"
          >
            <!-- Student -->
            <td>
              <div class="student-cell">
                <img :src="item.studentAvatar" :alt="item.studentName" class="student-avatar" />
                <span class="student-name">{{ item.studentName }}</span>
              </div>
            </td>

            <!-- Course Link -->
            <td>
              <NuxtLink :to="`/courses/${item.courseSlug}`" class="course-link">
                {{ item.courseTitle }}
              </NuxtLink>
            </td>

            <!-- Country -->
            <td>
              <span class="country-badge">{{ item.studentCountry }}</span>
            </td>

            <!-- Amount -->
            <td>
              <span class="amount-val">+${{ item.amount.toFixed(2) }}</span>
            </td>

            <!-- Date -->
            <td>
              <span class="date-val">{{ item.enrolledAt }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { RecentEnrollmentItem } from '~/types'

defineProps<{
  title?: string
  enrollments: RecentEnrollmentItem[]
}>()
</script>

<style scoped>
.table-card {
  border-radius: 16px;
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

.card-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
  text-decoration: none;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #c4b5fd;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.data-table th {
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table td {
  padding: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
}

.table-row {
  transition: background 0.15s;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.student-name {
  font-weight: 600;
  color: #f8fafc;
}

.course-link {
  color: #93c5fd;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  display: inline-block;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.country-badge {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.amount-val {
  font-weight: 700;
  color: #34d399;
}

.date-val {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.empty-state {
  text-align: center;
  padding: 30px !important;
  color: rgba(255, 255, 255, 0.35);
}
</style>
