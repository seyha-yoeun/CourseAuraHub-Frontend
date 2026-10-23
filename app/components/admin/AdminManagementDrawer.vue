<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition v-bind="drawerFade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-90 bg-black/70 backdrop-blur-md"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Side Panel -->
    <Transition v-bind="drawerSlide">
      <aside
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-100 flex w-120 max-w-[90vw] flex-col overflow-hidden border-l border-violet-500/30 bg-[#0d0e18] shadow-[-15px_0_50px_rgba(0,0,0,0.8),-5px_0_25px_rgba(124,58,237,0.15)] light:border-violet-500/25 light:bg-white light:shadow-[-15px_0_50px_rgba(0,0,0,0.15),-5px_0_25px_rgba(124,58,237,0.1)]"
        role="dialog"
        aria-label="Admin Management Panel"
      >
        <!-- Drawer Header -->
        <div class="flex items-center justify-between border-b border-white/8 bg-[#0a0a14]/50 p-4 sm:px-6 sm:py-5 light:border-slate-200 light:bg-slate-50">
          <div class="flex items-center gap-3">
            <div class="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] border border-violet-500/30 bg-violet-500/15">
              <ShieldAlert :size="20" class="text-violet-400" />
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-50 light:text-slate-900">Admin Management</h2>
              <p class="text-[11px] text-white/40 light:text-slate-500">Quick CRUD operations &amp; live data control</p>
            </div>
          </div>
          <button
            type="button"
            class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900"
            aria-label="Close admin drawer"
            @click="$emit('close')"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex gap-1.5 border-b border-white/6 bg-white/2 px-3 py-2.5 sm:px-4 light:border-slate-200 light:bg-slate-50">
          <button
            type="button"
            class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:px-3 sm:text-xs"
            :class="activeTab === 'courses'
              ? 'border-violet-500/35 bg-violet-500/15 text-violet-300 light:border-violet-200 light:bg-violet-100 light:text-violet-700'
              : 'border-transparent text-white/50 hover:bg-white/4 hover:text-white/80 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-800'"
            @click="activeTab = 'courses'"
          >
            <BookOpen :size="15" class="hidden shrink-0 sm:block" />
            <span>Courses <span class="hidden sm:inline">({{ courses.length }})</span></span>
          </button>
          <button
            type="button"
            class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:px-3 sm:text-xs"
            :class="activeTab === 'students'
              ? 'border-violet-500/35 bg-violet-500/15 text-violet-300 light:border-violet-200 light:bg-violet-100 light:text-violet-700'
              : 'border-transparent text-white/50 hover:bg-white/4 hover:text-white/80 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-800'"
            @click="activeTab = 'students'"
          >
            <Users :size="15" class="hidden shrink-0 sm:block" />
            <span>Students <span class="hidden sm:inline">({{ students.length }})</span></span>
          </button>
          <button
            type="button"
            class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:px-3 sm:text-xs"
            :class="activeTab === 'tools'
              ? 'border-violet-500/35 bg-violet-500/15 text-violet-300 light:border-violet-200 light:bg-violet-100 light:text-violet-700'
              : 'border-transparent text-white/50 hover:bg-white/4 hover:text-white/80 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-800'"
            @click="activeTab = 'tools'"
          >
            <Sliders :size="15" class="hidden shrink-0 sm:block" />
            <span>Quick Ops</span>
          </button>
        </div>

        <!-- Drawer Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5">
          <!-- TAB 1: COURSES CRUD -->
          <div v-if="activeTab === 'courses'" class="flex flex-col">
            <div class="mb-4 flex gap-2.5">
              <input
                v-model="courseSearch"
                type="text"
                placeholder="Search courses..."
                class="min-w-0 flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-100 outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
              >
              <button
                type="button"
                class="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white transition-all hover:from-violet-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                @click="openCreateCourse"
              >
                <Plus :size="14" />
                <span>Add</span>
              </button>
            </div>

            <div class="flex flex-col gap-2.5">
              <div
                v-for="c in filteredCourses"
                :key="c.id"
                class="flex flex-col gap-2.5 rounded-xl border border-white/6 bg-white/2 p-3 light:border-slate-200 light:bg-slate-50"
              >
                <div class="flex items-center gap-2.5">
                  <img :src="c.thumbnail" :alt="c.title" class="h-9 w-12 shrink-0 rounded-md object-cover" >
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ c.title }}</span>
                    <span class="mt-0.5 block truncate text-[11px] text-white/40 light:text-slate-500">
                      ${{ c.price }} • {{ c.totalStudents }} students • {{ c.category }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2 border-t border-white/4 pt-1.5 light:border-slate-200">
                  <!-- Quick Status Switcher -->
                  <select
                    :value="c.status"
                    class="cursor-pointer rounded-md border px-2 py-0.75 text-[11px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    :class="courseStatusClass(c.status)"
                    @change="e => updateCourseStatus(c.slug, (e.target as HTMLSelectElement).value)"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>

                  <NuxtLink
                    :to="`/courses/${c.slug}`"
                    class="flex size-7 items-center justify-center rounded-md border border-white/8 bg-white/4 text-white/60 transition-all hover:bg-white/8 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
                    title="View & Edit Full Course"
                    @click="$emit('close')"
                  >
                    <ExternalLink :size="14" />
                  </NuxtLink>

                  <button
                    type="button"
                    class="flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/8 bg-white/4 text-rose-400 transition-all hover:bg-rose-500/20 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-slate-200 light:bg-slate-100 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700"
                    title="Delete Course"
                    @click="deleteCourseAction(c.slug)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: STUDENTS CRUD -->
          <div v-else-if="activeTab === 'students'" class="flex flex-col">
            <div class="mb-4 flex gap-2.5">
              <input
                v-model="studentSearch"
                type="text"
                placeholder="Search students..."
                class="min-w-0 flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-100 outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
              >
              <button
                type="button"
                class="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white transition-all hover:from-violet-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                @click="showAddStudent = !showAddStudent"
              >
                <Plus :size="14" />
                <span>{{ showAddStudent ? 'Close' : 'Add' }}</span>
              </button>
            </div>

            <!-- Inline Quick Add Student Form -->
            <div v-if="showAddStudent" class="mb-4 rounded-xl border border-white/8 bg-white/3 p-3.5 light:border-slate-200 light:bg-slate-50">
              <h4 class="mb-2.5 text-[13px] font-bold text-slate-100 light:text-slate-900">Quick Add Student</h4>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  v-model="newStudent.name"
                  type="text"
                  placeholder="Full Name *"
                  class="w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-100 outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
                >
                <input
                  v-model="newStudent.email"
                  type="email"
                  placeholder="Email Address *"
                  class="w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-100 outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
                >
                <input
                  v-model="newStudent.country"
                  type="text"
                  placeholder="Country"
                  class="w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-100 outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
                >
                <select v-model="newStudent.status" class="w-full cursor-pointer rounded-lg border border-white/8 bg-zinc-900 px-3 py-2 text-xs text-slate-200 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                type="button"
                class="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                :disabled="creatingStudent"
                @click="submitNewStudent"
              >
                <Loader2 v-if="creatingStudent" :size="14" class="animate-spin" />
                <span>{{ creatingStudent ? 'Adding...' : 'Create Student' }}</span>
              </button>
            </div>

            <div class="flex flex-col gap-2.5">
              <div
                v-for="s in filteredStudents"
                :key="s.id"
                class="flex flex-col gap-2.5 rounded-xl border border-white/6 bg-white/2 p-3 light:border-slate-200 light:bg-slate-50"
              >
                <div class="flex items-center gap-2.5">
                  <img :src="s.avatar" :alt="s.name" class="size-9 shrink-0 rounded-full border border-violet-500/30" >
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ s.name }}</span>
                    <span class="mt-0.5 block truncate text-[11px] text-white/40 light:text-slate-500">
                      {{ s.email }} • {{ s.country }} • ${{ s.totalSpent.toFixed(2) }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2 border-t border-white/4 pt-1.5 light:border-slate-200">
                  <!-- Quick Status Toggle -->
                  <button
                    type="button"
                    class="cursor-pointer rounded-full border px-2.5 py-0.75 text-[11px] font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    :class="studentStatusClass(s.status)"
                    @click="toggleStudentStatus(s)"
                  >
                    {{ s.status }}
                  </button>

                  <button
                    type="button"
                    class="flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/8 bg-white/4 text-rose-400 transition-all hover:bg-rose-500/20 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-slate-200 light:bg-slate-100 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700"
                    title="Delete Student"
                    @click="deleteStudentAction(s.id)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: QUICK OPERATIONS -->
          <div v-else class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-2.5 rounded-[14px] border border-white/6 bg-white/2 p-4.5 light:border-slate-200 light:bg-slate-50">
              <div class="flex items-center gap-2">
                <Sparkles :size="18" class="text-amber-400" />
                <span class="text-sm font-bold text-slate-100 light:text-slate-900">Create Sample Course</span>
              </div>
              <p class="text-xs leading-relaxed text-white/45 light:text-slate-500">
                Creates a realistic course record directly in the backend database.
              </p>
              <button
                type="button"
                class="inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/15 px-4 py-2.25 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100 light:hover:text-violet-900"
                :disabled="seeding"
                @click="seedSampleCourse"
              >
                <Plus :size="14" />
                <span>Create Sample Course</span>
              </button>
            </div>

            <div class="flex flex-col gap-2.5 rounded-[14px] border border-white/6 bg-white/2 p-4.5 light:border-slate-200 light:bg-slate-50">
              <div class="flex items-center gap-2">
                <FileJson :size="18" class="text-blue-400" />
                <span class="text-sm font-bold text-slate-100 light:text-slate-900">Export Data Snapshot</span>
              </div>
              <p class="text-xs leading-relaxed text-white/45 light:text-slate-500">
                Download a JSON snapshot of the active course and student records from the backend.
              </p>
              <button
                type="button"
                class="inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/15 px-4 py-2.25 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100 light:hover:text-violet-900"
                @click="downloadDbBackup"
              >
                <Download :size="14" />
                <span>Export Data Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ShieldAlert,
  X,
  BookOpen,
  Users,
  Sliders,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  FileJson,
  Download
} from 'lucide-vue-next'
import type { Course, Student } from '~/types'
import { useAppToast } from '~/composables/useAppToast'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close' | 'open-create-course' | 'data-changed'): void
}>()

const { crud, error } = useAppToast()

const activeTab = ref<'courses' | 'students' | 'tools'>('courses')

const drawerFade = {
  enterActiveClass: 'transition-opacity duration-300 ease-out',
  leaveActiveClass: 'transition-opacity duration-300 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const drawerSlide = {
  enterActiveClass: 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
  leaveActiveClass: 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
  enterFromClass: 'translate-x-full',
  leaveToClass: 'translate-x-full'
}

// Course management
const courses = ref<Course[]>([])
const courseSearch = ref('')

// Student management
const students = ref<Student[]>([])
const studentSearch = ref('')
const showAddStudent = ref(false)
const creatingStudent = ref(false)
const seeding = ref(false)

const newStudent = reactive({
  name: '',
  email: '',
  country: 'United States',
  status: 'active' as 'active' | 'inactive'
})

function courseStatusClass(status: string) {
  if (status === 'published') return 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  if (status === 'draft') return 'border-amber-400/30 bg-amber-400/12 text-amber-400 light:border-amber-300 light:bg-amber-50 light:text-amber-700'
  return 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'
}

function studentStatusClass(status: string) {
  if (status === 'active') return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  return 'border-slate-400/30 bg-slate-400/15 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'
}

async function loadData() {
  try {
    const [cData, sData] = await Promise.all([
      $fetch<Course[]>(`/api/courses?_t=${Date.now()}`),
      $fetch<Student[]>(`/api/students?_t=${Date.now()}`)
    ])
    courses.value = cData || []
    students.value = sData || []
  } catch (err) {
    console.error('Failed to load admin drawer data:', err)
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      loadData()
    }
  }
)

const filteredCourses = computed(() => {
  if (!courseSearch.value.trim()) return courses.value
  const q = courseSearch.value.toLowerCase().trim()
  return courses.value.filter(c =>
    c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
  )
})

const filteredStudents = computed(() => {
  if (!studentSearch.value.trim()) return students.value
  const q = studentSearch.value.toLowerCase().trim()
  return students.value.filter(s =>
    s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
  )
})

async function updateCourseStatus(slug: string, status: string) {
  try {
    await $fetch(`/api/courses/${slug}`, {
      method: 'PUT',
      body: { status }
    })
    await loadData()
    emit('data-changed')
    crud('status', 'Course', slug)
  } catch (err: unknown) {
    error('Status Update Failed', (err as Error).message || 'Failed to update course status')
  }
}

async function deleteCourseAction(slug: string) {
  try {
    await $fetch(`/api/courses/${slug}`, {
      method: 'DELETE'
    })
    await loadData()
    emit('data-changed')
    crud('delete', 'Course', slug)
  } catch (err: unknown) {
    error('Delete Failed', (err as Error).message || 'Failed to delete course')
  }
}

async function toggleStudentStatus(student: Student) {
  const newStatus = student.status === 'active' ? 'inactive' : 'active'
  try {
    await $fetch(`/api/students/${student.id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    await loadData()
    emit('data-changed')
    crud('status', 'Student', student.name)
  } catch (err: unknown) {
    error('Student Status Failed', (err as Error).message || 'Failed to update student status')
  }
}

async function deleteStudentAction(id: number) {
  try {
    await $fetch(`/api/students/${id}`, {
      method: 'DELETE'
    })
    await loadData()
    emit('data-changed')
    crud('delete', 'Student', `ID: ${id}`)
  } catch (err: unknown) {
    error('Delete Failed', (err as Error).message || 'Failed to delete student')
  }
}

async function submitNewStudent() {
  if (!newStudent.name || !newStudent.email) {
    error('Missing Fields', 'Please provide student name and email')
    return
  }
  creatingStudent.value = true
  try {
    await $fetch('/api/students', {
      method: 'POST',
      body: {
        name: newStudent.name,
        email: newStudent.email,
        country: newStudent.country,
        status: newStudent.status,
      }
    })
    const createdName = newStudent.name
    newStudent.name = ''
    newStudent.email = ''
    showAddStudent.value = false
    await loadData()
    emit('data-changed')
    crud('create', 'Student', createdName)
  } catch (err: unknown) {
    error('Create Student Failed', (err as Error).message || 'Failed to create student')
  } finally {
    creatingStudent.value = false
  }
}

async function seedSampleCourse() {
  seeding.value = true
  const randomTitles = [
    'Full-Stack AI Agents with Vue 3 & LangChain',
    'Advanced Pinia Patterns & State Architectures',
    'Rust for TypeScript & Web Developers',
    'Micro-Frontends with Nuxt 4 & Module Federation'
  ]
  const title = randomTitles[Math.floor(Math.random() * randomTitles.length)]

  try {
    await $fetch('/api/courses', {
      method: 'POST',
      body: {
        title,
        description: 'Comprehensive advanced masterclass exploring cutting-edge architecture and patterns.',
        instructor: 'Alex Chen',
        category: 'Web Development',
        level: 'Advanced',
        price: 119.99,
        originalPrice: 179.99,
        status: 'published',
        totalLessons: 45,
        totalHours: 15.0,
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
        tags: ['Vue 3', 'Nuxt 4', 'Advanced']
      }
    })
    await loadData()
    emit('data-changed')
    crud('create', 'Course', title)
  } catch (err: unknown) {
    error('Seed Failed', (err as Error).message || 'Failed to seed course')
  } finally {
    seeding.value = false
  }
}

function downloadDbBackup() {
  const data = { courses: courses.value, students: students.value, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `academy-data-snapshot-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function openCreateCourse() {
  emit('close')
  emit('open-create-course')
}
</script>
