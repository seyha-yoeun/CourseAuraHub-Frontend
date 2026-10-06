<template>
  <div class="student-table-wrap glass">
    <!-- Controls bar -->
    <div class="table-controls">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by student name, email, country..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <AppDropdown
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="All Statuses"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="student-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Country</th>
            <th>Enrolled Courses</th>
            <th>Completed</th>
            <th>Total Spent</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th>Last Active</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredStudents.length === 0">
            <td colspan="8" class="empty-state">
              No students found matching your search criteria.
            </td>
          </tr>
          <tr
            v-for="student in filteredStudents"
            :key="student.id"
            class="student-row"
          >
            <!-- Student profile -->
            <td>
              <div class="profile-cell">
                <img :src="student.avatar" :alt="student.name" class="avatar-img" />
                <div class="profile-meta">
                  <span class="student-name">{{ student.name }}</span>
                  <span class="student-email">{{ student.email }}</span>
                </div>
              </div>
            </td>

            <!-- Country -->
            <td>
              <span class="country-pill">{{ student.country }}</span>
            </td>

            <!-- Enrolled courses count -->
            <td>
              <span class="courses-count">
                <BookOpen :size="13" class="text-violet-400" />
                {{ student.enrolledCourses ? student.enrolledCourses.length : 0 }} courses
              </span>
            </td>

            <!-- Completed courses count -->
            <td>
              <span class="completed-count">
                <CheckCircle2 :size="13" class="text-emerald-400" />
                {{ student.completedCourses ? student.completedCourses.length : 0 }} done
              </span>
            </td>

            <!-- Total spent -->
            <td>
              <span class="spent-val">${{ student.totalSpent.toFixed(2) }}</span>
            </td>

            <!-- Status -->
            <td>
              <span class="status-badge" :class="`status-${student.status}`">
                <span class="status-dot"></span>
                {{ student.status }}
              </span>
            </td>

            <!-- Joined -->
            <td>
              <span class="date-text">{{ student.joinedAt }}</span>
            </td>

            <!-- Last Active -->
            <td>
              <span class="date-text">{{ student.lastActive }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, BookOpen, CheckCircle2 } from 'lucide-vue-next'
import type { Student } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'

const props = defineProps<{
  students: Student[]
}>()

const searchQuery = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const filteredStudents = computed(() => {
  let list = props.students || []

  if (statusFilter.value !== 'all') {
    list = list.filter(s => s.status === statusFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    )
  }

  return list
})
</script>

<style scoped>
.student-table-wrap {
  border-radius: 18px;
  padding: 24px;
}

.table-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.07);
}

.status-select {
  padding: 10px 16px;
  background: #12131f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.table-container {
  overflow-x: auto;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.student-table th {
  padding: 12px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.student-table td {
  padding: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
}

.student-row {
  transition: background 0.15s;
}

.student-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.2);
  border: 1.5px solid rgba(124, 58, 237, 0.4);
}

.profile-meta {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: #f8fafc;
}

.student-email {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.country-pill {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.courses-count,
.completed-count {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
}

.spent-val {
  font-weight: 700;
  color: #34d399;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 99px;
  text-transform: capitalize;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-active {
  background: rgba(52, 211, 153, 0.12);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}
.status-active .status-dot {
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}
.status-inactive .status-dot {
  background: #94a3b8;
}

.date-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: rgba(255, 255, 255, 0.4);
}

/* Light mode overrides */
html.light .student-table-wrap {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

html.light .search-input {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

html.light .search-icon {
  color: #94a3b8;
}

html.light .student-table th {
  color: #64748b;
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

html.light .student-table td {
  color: #334155;
  border-bottom-color: rgba(0, 0, 0, 0.04);
}

html.light .student-row:hover {
  background: #f8fafc;
}

html.light .student-name {
  color: #0f172a;
}

html.light .student-email {
  color: #64748b;
}

html.light .country-pill {
  color: #334155;
  background: #f1f5f9;
  border-color: #e2e8f0;
}

html.light .date-text {
  color: #64748b;
}

html.light .empty-state {
  color: #94a3b8;
}
</style>
