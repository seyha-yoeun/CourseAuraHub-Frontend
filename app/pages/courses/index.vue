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

    <!-- Filters & Controls Bar with clean z-index stacking -->
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
          aria-label="Clear course search"
          @click="clearSearch"
        >
          <X :size="14" />
        </button>
      </div>

      <!-- Category Filter -->
      <div
        class="filter-item category-item"
        :class="{ 'is-active-dropdown': activeDropdown === 'category' }"
      >
        <AppDropdown
          v-model="selectedCategory"
          :options="categoryOptions"
          placeholder="All Categories"
          @change="onFilterChange"
          @toggle="(open) => handleDropdownToggle('category', open)"
        />
      </div>

      <!-- Status Filter -->
      <div
        class="filter-item status-item"
        :class="{ 'is-active-dropdown': activeDropdown === 'status' }"
      >
        <AppDropdown
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="All Statuses"
          @change="onFilterChange"
          @toggle="(open) => handleDropdownToggle('status', open)"
        />
      </div>

      <!-- Sort By -->
      <div
        class="filter-item sort-item"
        :class="{ 'is-active-dropdown': activeDropdown === 'sort' }"
      >
        <AppDropdown
          v-model="selectedSort"
          :options="sortOptions"
          placeholder="Sort By"
          @change="onSortChange"
          @toggle="(open) => handleDropdownToggle('sort', open)"
        />
      </div>
    </div>

    <!-- Courses Stats Summary Bar -->
    <div class="summary-pills">
      <span class="pill-stat">
        <strong>{{ courses.length }}</strong> Courses Found
      </span>
      <span class="pill-stat stat-published">
        <strong>{{ courses.filter(c => c.status === 'published').length }}</strong> Published
      </span>
      <span class="pill-stat stat-draft">
        <strong>{{ courses.filter(c => c.status === 'draft').length }}</strong> Drafts
      </span>
      <span class="pill-stat stat-archived">
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
import { useAppToast } from '~/composables/useAppToast'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import CourseCard from '~/components/courses/CourseCard.vue'
import CourseFormModal from '~/components/courses/CourseFormModal.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'

useHead({
  title: 'Course Catalog & Management'
})

const { courses, loading, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourses()
const { crud, error } = useAppToast()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const selectedSort = ref('createdAt:desc')
const activeDropdown = ref<string | null>(null)

function handleDropdownToggle(name: string, open: boolean) {
  if (open) {
    activeDropdown.value = name
  } else if (activeDropdown.value === name) {
    activeDropdown.value = null
  }
}

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Programming', label: 'Programming' },
  { value: 'Design', label: 'Design' },
  { value: 'Backend', label: 'Backend' },
  { value: 'DevOps', label: 'DevOps' }
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
]

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'revenue:desc', label: 'Highest Revenue' },
  { value: 'totalStudents:desc', label: 'Most Enrolled' },
  { value: 'rating:desc', label: 'Top Rated' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' }
]

// Modal & actions state
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingCourse = ref<Course | null>(null)
const deletingCourse = ref<Course | null>(null)
const formSubmitting = ref(false)
const deleteLoading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function triggerFetch() {
  const [sortField, sortOrder] = selectedSort.value.split(':')
  fetchCourses({
    status: selectedStatus.value,
    category: selectedCategory.value,
    search: searchQuery.value.trim() || undefined,
    sort: sortField,
    order: sortOrder
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
      crud('update', 'Course', formData.title)
    } else {
      await createCourse(formData)
      crud('create', 'Course', formData.title)
    }
    isFormModalOpen.value = false
    await triggerFetch()
  } catch (err: unknown) {
    error('Course Action Failed', (err as Error).message || 'Failed to save course')
  } finally {
    formSubmitting.value = false
  }
}

async function handleConfirmDelete() {
  if (!deletingCourse.value) return
  deleteLoading.value = true
  const courseTitle = deletingCourse.value.title
  try {
    await deleteCourse(deletingCourse.value.slug)
    crud('delete', 'Course', courseTitle)
    isDeleteModalOpen.value = false
    deletingCourse.value = null
    await triggerFetch()
  } catch (err: unknown) {
    error('Delete Failed', (err as Error).message || 'Failed to delete course')
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
  color: var(--text-primary, #f8fafc);
  letter-spacing: -0.5px;
}

html.light .page-title {
  color: #0f172a;
}

.page-sub {
  font-size: 13px;
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
  margin-top: 4px;
}

html.light .page-sub {
  color: #64748b;
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
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.25);
}

.create-btn:hover {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
  transform: translateY(-1px);
}

/* Filters Bar: Stacking context and clean isolation */
.filters-bar {
  border-radius: 16px;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: minmax(260px, 2fr) 1.2fr 1fr 1.3fr;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 30;
  overflow: visible;
}

@media (max-width: 1024px) {
  .filters-bar {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
}

@media (max-width: 640px) {
  .filters-bar {
    grid-template-columns: 1fr;
    padding: 14px;
    gap: 12px;
  }
}

.search-box {
  position: relative;
  width: 100%;
  z-index: 25;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  pointer-events: none;
}

html.light .search-icon {
  color: #94a3b8;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 36px 0 40px;
  background: var(--bg-input, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.09));
  border-radius: 10px;
  color: var(--text-primary, #f1f5f9);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

html.light .search-input {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.search-input::placeholder {
  color: var(--text-muted, rgba(255, 255, 255, 0.35));
}

html.light .search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  border-color: rgba(124, 58, 237, 0.65);
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.07));
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
}

html.light .search-input:focus {
  background: #ffffff;
  border-color: #7c3aed;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.15);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}

.clear-search:hover {
  color: var(--text-primary, #fff);
}

html.light .clear-search:hover {
  color: #0f172a;
}

/* Individual Filter Item Stacking hierarchy */
.filter-item {
  width: 100%;
  position: relative;
  z-index: 20;
}

.category-item { z-index: 24; }
.status-item { z-index: 23; }
.sort-item { z-index: 22; }

/* When any dropdown is open, elevate it above all adjacent inputs */
.filter-item.is-active-dropdown {
  z-index: 99 !important;
}

.summary-pills {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
}

.pill-stat {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  background: var(--bg-surface-glass, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
  padding: 5px 14px;
  border-radius: 99px;
  transition: all 0.2s;
}

html.light .pill-stat {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #334155;
}

.stat-published {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1) !important;
  border-color: rgba(16, 185, 129, 0.25) !important;
}

.stat-draft {
  color: #f59e0b !important;
  background: rgba(245, 158, 11, 0.1) !important;
  border-color: rgba(245, 158, 11, 0.25) !important;
}

.stat-archived {
  color: #94a3b8 !important;
  background: rgba(148, 163, 184, 0.1) !important;
  border-color: rgba(148, 163, 184, 0.25) !important;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  position: relative;
  z-index: 10;
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
  color: var(--text-primary, #f1f5f9);
}

html.light .empty-title {
  color: #0f172a;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
  margin-top: 6px;
  max-width: 360px;
}

html.light .empty-desc {
  color: #64748b;
}
</style>
