<template>
  <div v-if="pending" class="loading-state">
    <div class="shimmer skeleton-hero"></div>
    <div class="shimmer skeleton-content"></div>
  </div>

  <div v-else-if="error || !course" class="error-state glass">
    <AlertCircle :size="40" class="text-rose-400" />
    <h2 class="error-title">Course Not Found</h2>
    <p class="error-desc">We couldn't locate the course matching the slug "{{ route.params.slug }}".</p>
    <NuxtLink to="/courses" class="back-btn mt-4">
      <ArrowLeft :size="16" />
      <span>Back to Courses</span>
    </NuxtLink>
  </div>

  <div v-else class="course-detail-page">
    <!-- Back breadcrumb & actions topbar -->
    <div class="top-nav">
      <NuxtLink to="/courses" class="back-link">
        <ArrowLeft :size="15" />
        <span>All Courses</span>
      </NuxtLink>

      <div class="top-actions">
        <button
          type="button"
          class="btn-edit"
          @click="isEditModalOpen = true"
        >
          <Edit3 :size="15" />
          <span>Edit Course</span>
        </button>

        <button
          type="button"
          class="btn-delete"
          @click="isDeleteModalOpen = true"
        >
          <Trash2 :size="15" />
          <span>Delete</span>
        </button>
      </div>
    </div>

    <!-- Hero Card -->
    <div class="hero-card glass">
      <div class="hero-media">
        <img :src="course.thumbnail" :alt="course.title" class="hero-img" />
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <div class="hero-pills">
          <CourseStatusBadge :status="course.status" />
          <span class="meta-pill category-pill">{{ course.category }}</span>
          <span class="meta-pill">{{ course.level }}</span>
          <span v-if="course.rating > 0" class="meta-pill rating-pill">
            <Star :size="12" class="fill-amber-400 text-amber-400" />
            {{ course.rating.toFixed(1) }} Rating
          </span>
        </div>

        <h1 class="hero-title">{{ course.title }}</h1>
        <p class="hero-desc">{{ course.description }}</p>

        <div class="hero-instructor-row">
          <div class="instructor-badge">
            <img
              src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexAdmin&backgroundColor=b6e3f4"
              alt="Instructor"
              class="instructor-avatar"
            />
            <div>
              <span class="inst-label">Taught by</span>
              <span class="inst-name">{{ course.instructor }}</span>
            </div>
          </div>

          <div class="price-box">
            <span class="price-val">${{ course.price.toFixed(2) }}</span>
            <span v-if="course.originalPrice > course.price" class="price-orig">
              ${{ course.originalPrice.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <StatCard
        label="Total Course Revenue"
        :value="course.revenue"
        format="currency"
        sub="Gross earnings generated"
        :icon="DollarSign"
        accent-color="#8b5cf6"
      />
      <StatCard
        label="Enrolled Students"
        :value="course.totalStudents"
        format="number"
        sub="Active learning registrations"
        :icon="Users"
        accent-color="#3b82f6"
      />
      <StatCard
        label="Curriculum Volume"
        :value="`${course.totalHours} hrs`"
        :sub="`${course.totalLessons} structured lessons`"
        :icon="Clock"
        accent-color="#10b981"
      />
      <StatCard
        label="Completion Rate"
        :value="course.completionRate"
        format="percent"
        sub="Average student graduation"
        :icon="GraduationCap"
        accent-color="#f59e0b"
      />
    </div>

    <!-- Course Monthly Performance Chart -->
    <div class="chart-section">
      <SalesChart
        :title="`${course.title} - Performance`"
        subtitle="Monthly sales and enrollment progression for this specific course"
        :months="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']"
        :monthly-revenue="course.monthlyRevenue || []"
        :monthly-enrollments="course.monthlyEnrollments || []"
      />
    </div>

    <!-- Two-Column: Enrolled Students List & Course Metadata -->
    <div class="bottom-layout">
      <!-- Enrolled Students Table -->
      <div class="students-section glass">
        <div class="section-header">
          <div>
            <h3 class="section-title">Enrolled Students</h3>
            <p class="section-sub">Students actively studying this program</p>
          </div>
          <span class="students-count-badge">
            {{ enrolledStudents.length }} Enrolled
          </span>
        </div>

        <div v-if="enrolledStudents.length === 0" class="no-students">
          <Users :size="28" class="text-white/30 mb-2" />
          <p>No students enrolled in this course yet.</p>
        </div>

        <div v-else class="enrolled-table-wrap">
          <table class="enrolled-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Country</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in enrolledStudents" :key="s.id">
                <td>
                  <div class="student-name-cell">
                    <img :src="s.avatar" :alt="s.name" class="s-avatar" />
                    <div class="s-meta">
                      <span class="s-name">{{ s.name }}</span>
                      <span class="s-email">{{ s.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="s-country">{{ s.country }}</span>
                </td>
                <td>
                  <span class="s-status" :class="`status-${s.status}`">
                    {{ s.status }}
                  </span>
                </td>
                <td>
                  <span class="s-date">{{ s.joinedAt }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Course Tags & Details Sidebar -->
      <div class="details-sidebar glass">
        <h3 class="section-title mb-3">Course Specifications</h3>

        <div class="spec-list">
          <div class="spec-row">
            <span class="spec-lbl">Category:</span>
            <span class="spec-val">{{ course.category }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-lbl">Skill Level:</span>
            <span class="spec-val">{{ course.level }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-lbl">Total Lessons:</span>
            <span class="spec-val">{{ course.totalLessons }} modules</span>
          </div>
          <div class="spec-row">
            <span class="spec-lbl">Video Duration:</span>
            <span class="spec-val">{{ course.totalHours }} hours</span>
          </div>
          <div class="spec-row">
            <span class="spec-lbl">Initial Launch:</span>
            <span class="spec-val">{{ course.createdAt }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-lbl">Last Updated:</span>
            <span class="spec-val">{{ course.updatedAt }}</span>
          </div>
        </div>

        <div class="tags-section mt-5">
          <span class="spec-lbl block mb-2">Technologies & Tags:</span>
          <div class="tags-flex">
            <span v-for="tag in course.tags" :key="tag" class="tag-chip">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CourseFormModal
      :is-open="isEditModalOpen"
      :course="course"
      :loading="saving"
      @close="isEditModalOpen = false"
      @submit="handleUpdateCourse"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      :item-name="course.title"
      :loading="deleting"
      @close="isDeleteModalOpen = false"
      @confirm="handleDeleteCourse"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Star,
  DollarSign,
  Users,
  Clock,
  GraduationCap,
  AlertCircle
} from 'lucide-vue-next'
import type { Course, CourseFormData, Student } from '~/types'
import CourseStatusBadge from '~/components/courses/CourseStatusBadge.vue'
import StatCard from '~/components/shared/StatCard.vue'
import SalesChart from '~/components/dashboard/SalesChart.vue'
import CourseFormModal from '~/components/courses/CourseFormModal.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import { useCourses } from '~/composables/useCourses'

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug))

const { updateCourse, deleteCourse } = useCourses()

const { data: course, pending, error, refresh } = await useAsyncData<Course>(
  `course-detail-${slug.value}`,
  () => $fetch<Course>(`/api/courses/${slug.value}`)
)

useHead({
  title: computed(() => course.value?.title ? `${course.value.title} - Analytics` : 'Course Details')
})

const enrolledStudents = computed<Student[]>(() => {
  return (course.value?.enrolledStudentList || []) as Student[]
})

// Modal states
const isEditModalOpen = ref(false)
const saving = ref(false)
const isDeleteModalOpen = ref(false)
const deleting = ref(false)

async function handleUpdateCourse(formData: CourseFormData) {
  saving.value = true
  try {
    await updateCourse(slug.value, formData)
    isEditModalOpen.value = false
    await refresh()
  } catch (err: unknown) {
    alert((err as Error).message || 'Failed to update course')
  } finally {
    saving.value = false
  }
}

async function handleDeleteCourse() {
  deleting.value = true
  try {
    await deleteCourse(slug.value)
    isDeleteModalOpen.value = false
    router.push('/courses')
  } catch (err: unknown) {
    alert((err as Error).message || 'Failed to delete course')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.course-detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #a78bfa;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #c4b5fd;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.35);
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: rgba(124, 58, 237, 0.3);
  color: #fff;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fb7185;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: rgba(244, 63, 94, 0.2);
  color: #fff;
}

.hero-card {
  border-radius: 20px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 360px 1fr;
  background: rgba(15, 15, 25, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 900px) {
  .hero-card {
    grid-template-columns: 1fr;
  }
}

.hero-media {
  position: relative;
  width: 100%;
  min-height: 240px;
  overflow: hidden;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(15, 15, 25, 0.8) 100%);
}

.hero-content {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.meta-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-pill {
  background: rgba(124, 58, 237, 0.2);
  color: #c4b5fd;
  border-color: rgba(124, 58, 237, 0.35);
}

.rating-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

.hero-title {
  font-size: 26px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.25;
}

.hero-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin-top: 10px;
}

.hero-instructor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.instructor-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instructor-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(124, 58, 237, 0.4);
}

.inst-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
}

.inst-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-val {
  font-size: 24px;
  font-weight: 800;
  color: #34d399;
}

.price-orig {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: line-through;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.bottom-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 960px) {
  .bottom-layout {
    grid-template-columns: 1fr;
  }
}

.students-section,
.details-sidebar {
  border-radius: 18px;
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

.section-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.students-count-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 99px;
  background: rgba(124, 58, 237, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.no-students {
  text-align: center;
  padding: 40px 10px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.enrolled-table-wrap {
  overflow-x: auto;
}

.enrolled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.enrolled-table th {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.enrolled-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.student-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.s-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.2);
}

.s-meta {
  display: flex;
  flex-direction: column;
}

.s-name {
  font-weight: 600;
  color: #f1f5f9;
}

.s-email {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.s-country {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.s-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: capitalize;
}

.status-active {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}
.status-inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.s-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.spec-lbl {
  color: rgba(255, 255, 255, 0.45);
}

.spec-val {
  color: #e2e8f0;
  font-weight: 600;
}

.tags-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  font-size: 11px;
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.25);
  padding: 3px 9px;
  border-radius: 6px;
}

.loading-state,
.error-state {
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 20px;
}

.skeleton-hero {
  width: 100%;
  height: 280px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.skeleton-content {
  width: 100%;
  height: 350px;
  border-radius: 20px;
}

.error-title {
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
  margin-top: 12px;
}

.error-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}
</style>
