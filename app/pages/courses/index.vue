<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ auth.isAdmin ? 'Course Management' : 'Explore Courses' }}</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">
          {{ auth.isAdmin ? 'Create, edit, analyze, and manage your online educational catalog.' : 'Find your next course. Free courses can be started right away.' }}
        </p>
      </div>

      <button
        v-if="auth.isAdmin"
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        @click="openCreateModal"
      >
        <Plus :size="16" />
        <span>Create Course</span>
      </button>
    </div>

    <!-- Filters & Controls Bar with clean z-index stacking -->
    <div class="relative z-30 grid grid-cols-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-[minmax(260px,2fr)_1.2fr_1fr_1.3fr] lg:px-5 light:border-slate-200 light:bg-white">
      <!-- Search Input -->
      <div class="relative z-20 w-full">
        <Search :size="16" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/40 light:text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title, instructor, or tags..."
          class="h-10.5 w-full rounded-[10px] border border-white/9 bg-white/4 pr-9 pl-10 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/35 focus:border-violet-500/65 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/20 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
          @input="onFilterChange"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded p-1 text-white/40 transition-colors hover:text-white light:text-slate-400 light:hover:text-slate-900"
          aria-label="Clear course search"
          @click="clearSearch"
        >
          <X :size="14" />
        </button>
      </div>

      <!-- Category Filter -->
      <div
        class="relative z-20 w-full"
        :class="{ 'z-30': activeDropdown === 'category' }"
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
        class="relative z-20 w-full"
        :class="{ 'z-30': activeDropdown === 'status' }"
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
        class="relative z-20 w-full"
        :class="{ 'z-30': activeDropdown === 'sort' }"
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
    <div class="relative z-10 flex flex-wrap items-center gap-3">
      <span class="rounded-full border border-white/6 bg-white/3 px-3.5 py-1.25 text-xs text-white/60 transition-all light:border-slate-200 light:bg-slate-100 light:text-slate-700">
        <strong>{{ courses.length }}</strong> Courses Found
      </span>
      <span v-if="auth.isAdmin" class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.25 text-xs text-emerald-500 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700">
        <strong>{{ courses.filter(c => c.status === 'published').length }}</strong> Published
      </span>
      <span v-if="auth.isAdmin" class="rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1.25 text-xs text-amber-500 light:border-amber-200 light:bg-amber-50 light:text-amber-700">
        <strong>{{ courses.filter(c => c.status === 'draft').length }}</strong> Drafts
      </span>
      <span v-if="auth.isAdmin" class="rounded-full border border-slate-400/25 bg-slate-400/10 px-3.5 py-1.25 text-xs text-slate-400 light:border-slate-200 light:bg-slate-100 light:text-slate-600">
        <strong>{{ courses.filter(c => c.status === 'archived').length }}</strong> Archived
      </span>
    </div>

    <!-- Course Cards Grid -->
    <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div v-for="i in 6" :key="i" class="h-95 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="courses.length === 0" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center backdrop-blur-md light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-violet-500/30 bg-violet-500/15">
        <BookOpen :size="32" class="text-violet-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">No courses found</h3>
      <p class="mt-1.5 max-w-90 text-[13px] text-white/45 light:text-slate-500">
        {{ auth.isAdmin ? 'Try adjusting your search criteria or create a brand new course to get started.' : 'Try adjusting your search or filters.' }}
      </p>
      <button
        v-if="auth.isAdmin"
        type="button"
        class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        @click="openCreateModal"
      >
        <Plus :size="16" />
        <span>Create New Course</span>
      </button>
    </div>

    <div v-else class="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
        :can-manage="auth.isAdmin"
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

const auth = useAuth()
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

const categoryOptions = computed(() => {
  const categories = new Set<string>()
  for (const c of courses.value) {
    if (c.category) {
      categories.add(c.category)
    }
  }
  return [
    { value: 'all', label: 'All Categories' },
    ...Array.from(categories).sort().map(cat => ({ value: cat, label: cat }))
  ]
})

const statusOptions = computed(() => {
  if (!auth.isAdmin) {
    return [
      { value: 'all', label: 'All Statuses' },
      { value: 'published', label: 'Published' }
    ]
  }
  return [
    { value: 'all', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ]
})

const sortOptions = computed(() => [
  { value: 'createdAt:desc', label: 'Newest First' },
  ...(auth.isAdmin ? [{ value: 'revenue:desc', label: 'Highest Revenue' }] : []),
  { value: 'totalStudents:desc', label: auth.isAdmin ? 'Most Enrolled' : 'Most Popular' },
  { value: 'rating:desc', label: 'Top Rated' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' }
])

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
