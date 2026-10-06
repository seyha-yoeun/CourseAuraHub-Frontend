<template>
  <div class="courses-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Course Management</h1>
        <p class="page-sub">
          Create, edit, analyze, and manage your online educational catalog.
        </p>
      </div>

      <button type="button" class="create-btn" @click="openCreateModal">
        <Plus :size="16" />
        <span>Create Course</span>
      </button>
    </div>

    <!-- Filters & Controls Bar -->
    <div class="filters-bar glass">
      <!-- Search Input -->
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title, instructor, or tags..."
          class="search-input"
          @input="onFilterChange"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search"
          @click="clearSearch"
        >
          <X :size="14" />
        </button>
      </div>

      <!-- Category Filter -->
      <div class="filter-item">
        <select v-model="selectedCategory" class="filter-select" @change="onFilterChange">
          <option value="all">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Programming">Programming</option>
          <option value="Design">Design</option>
          <option value="Backend">Backend</option>
          <option value="DevOps">DevOps</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="filter-item">
        <select v-model="selectedStatus" class="filter-select" @change="onFilterChange">
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <!-- Sort By -->
      <div class="filter-item">
        <select v-model="selectedSort" class="filter-select" @change="onSortChange">
          <option value="createdAt:desc">Newest First</option>
          <option value="revenue:desc">Highest Revenue</option>
          <option value="totalStudents:desc">Most Enrolled</option>
          <option value="rating:desc">Top Rated</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
        </select>
      </div>
    </div>

    <!-- Courses Stats Summary Bar -->
    <div class="summary-pills">
      <span class="pill-stat">
        <strong>{{ courses.length }}</strong> Courses Found
      </span>
      <span class="pill-stat text-emerald-400">
        <strong>{{ courses.filter(c => c.status === 'published').length }}</strong> Published
      </span>
      <span class="pill-stat text-amber-400">
        <strong>{{ courses.filter(c => c.status === 'draft').length }}</strong> Drafts
      </span>
      <span class="pill-stat text-slate-400">
        <strong>{{ courses.filter(c => c.status === 'archived').length }}</strong> Archived
      </span>
    </div>

    <!-- Course Cards Grid -->
    <div v-if="loading" class="grid-loading">
      <div v-for="i in 6" :key="i" class="shimmer skeleton-card"></div>
    </div>

    <div v-else-if="courses.length === 0" class="empty-courses glass">
      <div class="empty-icon-wrap">
        <BookOpen :size="32" class="text-violet-400" />
      </div>
      <h3 class="empty-title">No courses found</h3>
      <p class="empty-desc">
        Try adjusting your search criteria or create a brand new course to get started.
      </p>
      <button type="button" class="create-btn mt-4" @click="openCreateModal">
        <Plus :size="16" />
        <span>Create New Course</span>
      </button>
    </div>

    <div v-else class="courses-grid">
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
        @edit="openEditModal"
        @delete="openDeleteConfirm"
      />
    </div>

    <!-- Create / Edit Modal -->
    <CourseFormModal
      :is-open="isFormModalOpen"
      :course="editingCourse"
      :loading="formSubmitting"
      @close="isFormModalOpen = false"
      @submit="handleFormSubmit"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      :item-name="deletingCourse?.title"
      :loading="deleteLoading"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Search, X, BookOpen } from 'lucide-vue-next'
import type { Course, CourseFormData } from '~/types'
import { useCourses } from '~/composables/useCourses'
import CourseCard from '~/components/courses/CourseCard.vue'
import CourseFormModal from '~/components/courses/CourseFormModal.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'

useHead({
  title: 'Course Catalog & Management'
})

const { courses, loading, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourses()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const selectedSort = ref('createdAt:desc')

// Modal states
const isFormModalOpen = ref(false)
const editingCourse = ref<Course | null>(null)
const formSubmitting = ref(false)

const isDeleteModalOpen = ref(false)
const deletingCourse = ref<Course | null>(null)
const deleteLoading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function triggerFetch() {
  const [sortField, sortOrder] = selectedSort.value.split(':')
  fetchCourses({
    search: searchQuery.value,
    category: selectedCategory.value,
    status: selectedStatus.value,
    sort: sortField,
    order: sortOrder,
  })
}

function onFilterChange() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    triggerFetch()
  }, 250)
}

function onSortChange() {
  triggerFetch()
}

function clearSearch() {
  searchQuery.value = ''
  triggerFetch()
}

function openCreateModal() {
  editingCourse.value = null
  isFormModalOpen.value = true
}

function openEditModal(c: Course) {
  editingCourse.value = c
  isFormModalOpen.value = true
}

function openDeleteConfirm(c: Course) {
  deletingCourse.value = c
  isDeleteModalOpen.value = true
}

async function handleFormSubmit(formData: CourseFormData) {
  formSubmitting.value = true
  try {
    if (editingCourse.value) {
      await updateCourse(editingCourse.value.slug, formData)
    } else {
      await createCourse(formData)
    }
    isFormModalOpen.value = false
    await triggerFetch()
  } catch (err: unknown) {
    alert((err as Error).message || 'Failed to save course')
  } finally {
    formSubmitting.value = false
  }
}

async function handleConfirmDelete() {
  if (!deletingCourse.value) return
  deleteLoading.value = true
  try {
    await deleteCourse(deletingCourse.value.slug)
    isDeleteModalOpen.value = false
    deletingCourse.value = null
    await triggerFetch()
  } catch (err: unknown) {
    alert((err as Error).message || 'Failed to delete course')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  triggerFetch()
})
</script>

<style scoped>
.courses-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

.filters-bar {
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 2;
  min-width: 240px;
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
  padding: 9px 34px 9px 36px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.06);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
}

.filter-item {
  flex: 1;
  min-width: 160px;
}

.filter-select {
  width: 100%;
  padding: 9px 14px;
  background: #11121d;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.summary-pills {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pill-stat {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 4px 12px;
  border-radius: 99px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.grid-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.skeleton-card {
  height: 380px;
  border-radius: 18px;
}

.empty-courses {
  border-radius: 20px;
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
}

.empty-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 6px;
  max-width: 360px;
}
</style>
