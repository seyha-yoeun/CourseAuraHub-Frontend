<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ auth.isAdmin ? t('Course Management') : t('Explore Courses') }}</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">
          {{ auth.isAdmin ? t('Create, edit, analyze, and manage your online educational catalog.') : t('Find your next course. Free courses can be started right away.') }}
        </p>
      </div>

      <button
        v-if="auth.isAdmin"
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        @click="openCreateModal"
      >
        <Plus :size="16" />
        <span>{{ t('Create Course') }}</span>
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
          :placeholder="t('Search by title, instructor, or tags...')"
          class="h-10.5 w-full rounded-[10px] border border-white/9 bg-white/4 pr-9 pl-10 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/35 focus:border-violet-500/65 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/20 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
          @input="onFilterChange"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded p-1 text-white/40 transition-colors hover:text-white light:text-slate-400 light:hover:text-slate-900"
          :aria-label="t('Clear course search')"
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
          :placeholder="t('All Categories')"
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
          :placeholder="t('All Statuses')"
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
          :placeholder="t('Sort By')"
          @change="onSortChange"
          @toggle="(open) => handleDropdownToggle('sort', open)"
        />
      </div>
    </div>

    <!-- More filters -->
    <div class="relative z-20 flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50"
          :aria-expanded="showMoreFilters"
          aria-controls="catalog-more-filters"
          @click="showMoreFilters = !showMoreFilters"
        >
          <SlidersHorizontal :size="14" />
          {{ t('More filters') }}
          <span v-if="activeFilterCount" class="rounded-full bg-violet-500/25 px-1.75 text-[10px] text-violet-200 light:bg-violet-100 light:text-violet-700">{{ activeFilterCount }}</span>
        </button>
        <button
          v-if="activeFilterCount"
          type="button"
          class="cursor-pointer text-xs font-semibold text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-900"
          @click="resetFilters"
        >
          {{ t('Clear filters') }}
        </button>
      </div>

      <div
        v-show="showMoreFilters"
        id="catalog-more-filters"
        class="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 light:border-slate-200 light:bg-white"
      >
        <div class="flex flex-col gap-1.5" :class="{ 'z-30': activeDropdown === 'level' }">
          <span class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">{{ t('Level') }}</span>
          <AppDropdown v-model="filters.level" :options="levelOptions" :aria-label="t('Level')" @change="onFilterChange" @toggle="(open) => handleDropdownToggle('level', open)" />
        </div>
        <div class="flex flex-col gap-1.5" :class="{ 'z-30': activeDropdown === 'pricing' }">
          <span class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">{{ t('Price') }}</span>
          <AppDropdown v-model="filters.pricing" :options="pricingOptions" :aria-label="t('Price')" @change="onFilterChange" @toggle="(open) => handleDropdownToggle('pricing', open)" />
        </div>
        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">{{ t('Min price ($)') }}</span>
          <input v-model="filters.minPrice" type="number" min="0" step="1" inputmode="decimal" :placeholder="t('Any')" class="h-10 w-full rounded-[10px] border border-white/9 bg-white/4 px-3 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/35 focus:border-violet-500/65 focus:ring-2 focus:ring-violet-500/20 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400" @input="onFilterChange">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">{{ t('Max price ($)') }}</span>
          <input v-model="filters.maxPrice" type="number" min="0" step="1" inputmode="decimal" :placeholder="t('Any')" class="h-10 w-full rounded-[10px] border border-white/9 bg-white/4 px-3 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/35 focus:border-violet-500/65 focus:ring-2 focus:ring-violet-500/20 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400" @input="onFilterChange">
        </label>
        <div class="flex flex-col gap-1.5" :class="{ 'z-30': activeDropdown === 'rating' }">
          <span class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">{{ t('Rating') }}</span>
          <AppDropdown v-model="filters.minRating" :options="ratingOptions" :aria-label="t('Minimum rating')" @change="onFilterChange" @toggle="(open) => handleDropdownToggle('rating', open)" />
        </div>
        <div class="flex flex-col gap-1.5" :class="{ 'z-30': activeDropdown === 'duration' }">
          <span class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">{{ t('Duration') }}</span>
          <AppDropdown v-model="filters.duration" :options="durationOptions" :aria-label="t('Duration')" @change="onFilterChange" @toggle="(open) => handleDropdownToggle('duration', open)" />
        </div>
        <label class="flex cursor-pointer items-center gap-2 text-[13px] text-slate-200 sm:col-span-2 lg:col-span-3 xl:col-span-6 light:text-slate-700">
          <input v-model="filters.onSale" type="checkbox" class="size-4 accent-violet-600" @change="onFilterChange">
          {{ t('On sale now') }}
        </label>
      </div>
    </div>

    <p
      v-if="fetchError"
      role="alert"
      class="rounded-xl border border-rose-500/25 bg-rose-500/8 px-4 py-2.5 text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700"
    >
      {{ fetchError }}
    </p>

    <!-- Courses Stats Summary Bar -->
    <div class="relative z-10 flex flex-wrap items-center gap-3">
      <span class="rounded-full border border-white/6 bg-white/3 px-3.5 py-1.25 text-xs text-white/60 transition-all light:border-slate-200 light:bg-slate-100 light:text-slate-700">
        <strong>{{ courses.length }}</strong> {{ t('Courses Found') }}
      </span>
      <span v-if="auth.isAdmin" class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.25 text-xs text-emerald-500 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700">
        <strong>{{ courses.filter(c => c.status === 'published').length }}</strong> {{ t('Published') }}
      </span>
      <span v-if="auth.isAdmin" class="rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1.25 text-xs text-amber-500 light:border-amber-200 light:bg-amber-50 light:text-amber-700">
        <strong>{{ courses.filter(c => c.status === 'draft').length }}</strong> {{ t('Drafts') }}
      </span>
      <span v-if="auth.isAdmin" class="rounded-full border border-slate-400/25 bg-slate-400/10 px-3.5 py-1.25 text-xs text-slate-400 light:border-slate-200 light:bg-slate-100 light:text-slate-600">
        <strong>{{ courses.filter(c => c.status === 'archived').length }}</strong> {{ t('Archived') }}
      </span>

      <!-- View Toggle -->
      <div
        v-if="auth.isAdmin"
        class="ml-auto inline-flex items-center gap-1 rounded-[10px] border border-white/8 bg-white/4 p-1 light:border-slate-200 light:bg-slate-100"
        role="group"
        :aria-label="t('Course view')"
      >
        <button
          v-for="option in viewOptions"
          :key="option.value"
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          :class="viewMode === option.value
            ? 'bg-violet-500/25 text-violet-200 light:bg-white light:text-violet-700 light:shadow-sm'
            : 'text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-900'"
          :aria-pressed="viewMode === option.value"
          @click="viewMode = option.value"
        >
          <component :is="option.icon" :size="14" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>

    <!-- Course Table / Cards -->
    <div v-if="loading && showTable" class="flex flex-col gap-2 rounded-[18px] border border-white/10 bg-white/5 p-4 light:border-slate-200 light:bg-white">
      <div v-for="i in 6" :key="i" class="h-14 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div v-for="i in 6" :key="i" class="h-95 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="courses.length === 0" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center backdrop-blur-md light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-violet-500/30 bg-violet-500/15">
        <BookOpen :size="32" class="text-violet-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">{{ t('No courses found') }}</h3>
      <p class="mt-1.5 max-w-90 text-[13px] text-white/45 light:text-slate-500">
        {{ auth.isAdmin ? t('Try adjusting your search criteria or create a brand new course to get started.') : t('Try adjusting your search or filters.') }}
      </p>
      <button
        v-if="auth.isAdmin"
        type="button"
        class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        @click="openCreateModal"
      >
        <Plus :size="16" />
        <span>{{ t('Create New Course') }}</span>
      </button>
    </div>

    <CourseTable
      v-else-if="showTable"
      :courses="courses"
      @edit="openEditModal"
      @delete="openDeleteConfirm"
    />

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
import { Plus, Search, X, BookOpen, LayoutGrid, SlidersHorizontal, Table2 } from 'lucide-vue-next'
import type { Course, CourseFormData } from '~/types'
import { useCourses } from '~/composables/useCourses'
import type { CourseQuery } from '~/composables/useCourses'
import { useAppToast } from '~/composables/useAppToast'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import CourseCard from '~/components/courses/CourseCard.vue'
import CourseTable from '~/components/courses/CourseTable.vue'
import CourseFormModal from '~/components/courses/CourseFormModal.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'

const { t } = useT()

useHead({ title: () => t('Course Catalog & Management') })

const auth = useAuth()
const { courses, loading, error: fetchError, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourses()
const { crud, error } = useAppToast()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const selectedSort = ref('createdAt:desc')
const activeDropdown = ref<string | null>(null)

// Admins choose between table and cards; learners always see cards
const viewMode = useCookie<'table' | 'card'>('courses-view', {
  default: () => 'table',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax'
})
const showTable = computed(() => auth.isAdmin && viewMode.value !== 'card')

const viewOptions = [
  { value: 'table', label: t('Table'), icon: Table2 },
  { value: 'card', label: t('Cards'), icon: LayoutGrid }
] as const

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
    { value: 'all', label: t('All Categories') },
    ...Array.from(categories).sort().map(cat => ({ value: cat, label: cat }))
  ]
})

const statusOptions = computed(() => {
  if (!auth.isAdmin) {
    return [
      { value: 'all', label: t('All Statuses') },
      { value: 'published', label: t('Published') }
    ]
  }
  return [
    { value: 'all', label: t('All Statuses') },
    { value: 'published', label: t('Published') },
    { value: 'draft', label: t('Draft') },
    { value: 'archived', label: t('Archived') }
  ]
})

const DEFAULT_SORT = 'createdAt:desc'
const RELEVANCE = 'relevance'

const sortOptions = computed(() => [
  // Full-text ranking only means something while searching
  ...(searchQuery.value.trim() ? [{ value: RELEVANCE, label: t('Best Match') }] : []),
  { value: DEFAULT_SORT, label: t('Newest First') },
  ...(auth.isAdmin ? [{ value: 'revenue:desc', label: t('Highest Revenue') }] : []),
  { value: 'totalStudents:desc', label: t(auth.isAdmin ? 'Most Enrolled' : 'Most Popular') },
  { value: 'rating:desc', label: t('Top Rated') },
  { value: 'price:asc', label: t('Price: Low to High') },
  { value: 'price:desc', label: t('Price: High to Low') }
])

// Modal & actions state
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingCourse = ref<Course | null>(null)
const deletingCourse = ref<Course | null>(null)
const formSubmitting = ref(false)
const deleteLoading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Extra filters beyond category, status and sort
const showMoreFilters = ref(false)
const filters = reactive({
  level: 'all',
  pricing: 'all',
  minPrice: '' as string | number,
  maxPrice: '' as string | number,
  minRating: 'any',
  duration: 'any',
  onSale: false
})

const levelOptions = computed(() => [
  { value: 'all', label: t('All Levels') },
  { value: 'beginner', label: t('Beginner') },
  { value: 'intermediate', label: t('Intermediate') },
  { value: 'advanced', label: t('Advanced') }
])

const pricingOptions = computed(() => [
  { value: 'all', label: t('Free and paid') },
  { value: 'free', label: t('Free') },
  { value: 'paid', label: t('Paid') }
])

const ratingOptions = computed(() => [
  { value: 'any', label: t('Any rating') },
  { value: '4.5', label: t('4.5 and up') },
  { value: '4', label: t('4.0 and up') },
  { value: '3', label: t('3.0 and up') }
])

// Hour ranges sent as minHours / maxHours
const DURATIONS: Record<string, { min?: number, max?: number }> = {
  short: { max: 2 },
  medium: { min: 2, max: 5 },
  long: { min: 5, max: 10 },
  extended: { min: 10 }
}

const durationOptions = computed(() => [
  { value: 'any', label: t('Any length') },
  { value: 'short', label: t('Under 2 hours') },
  { value: 'medium', label: t('2 to 5 hours') },
  { value: 'long', label: t('5 to 10 hours') },
  { value: 'extended', label: t('10+ hours') }
])

const activeFilterCount = computed(() => [
  filters.level !== 'all',
  filters.pricing !== 'all',
  filters.minPrice !== '',
  filters.maxPrice !== '',
  filters.minRating !== 'any',
  filters.duration !== 'any',
  filters.onSale
].filter(Boolean).length)

function resetFilters() {
  Object.assign(filters, { level: 'all', pricing: 'all', minPrice: '', maxPrice: '', minRating: 'any', duration: 'any', onSale: false })
  triggerFetch()
}

function toNumber(value: string | number) {
  return value === '' || value === null ? undefined : Number(value)
}

// Searching switches the default order to the best match, and back when the search is cleared.
// Sync, because clearing the search fetches straight away.
watch(searchQuery, (value, previous) => {
  if (value.trim() && !previous.trim() && selectedSort.value === DEFAULT_SORT) {
    selectedSort.value = RELEVANCE
  } else if (!value.trim() && selectedSort.value === RELEVANCE) {
    selectedSort.value = DEFAULT_SORT
  }
}, { flush: 'sync' })

function triggerFetch() {
  const [sortField, sortOrder] = selectedSort.value.split(':')
  const duration = DURATIONS[filters.duration] ?? {}
  const query: CourseQuery = {
    status: selectedStatus.value,
    category: selectedCategory.value,
    search: searchQuery.value.trim() || undefined,
    sort: sortField,
    order: sortOrder,
    level: filters.level,
    minPrice: toNumber(filters.minPrice),
    maxPrice: toNumber(filters.maxPrice),
    free: filters.pricing === 'all' ? undefined : filters.pricing === 'free',
    onSale: filters.onSale || undefined,
    minRating: filters.minRating === 'any' ? undefined : Number(filters.minRating),
    minHours: duration.min,
    maxHours: duration.max
  }
  fetchCourses(query)
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
