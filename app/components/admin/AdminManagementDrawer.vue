<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="drawer-fade">
      <div
        v-if="isOpen"
        class="admin-backdrop"
        @click="$emit('close')"
      ></div>
    </Transition>

    <!-- Side Panel -->
    <Transition name="drawer-slide">
      <aside
        v-if="isOpen"
        class="admin-drawer glass"
        role="dialog"
        aria-label="Admin Management Panel"
      >
        <!-- Drawer Header -->
        <div class="drawer-header">
          <div class="header-title-wrap">
            <div class="admin-badge-icon">
              <ShieldAlert :size="20" class="text-violet-400" />
            </div>
            <div>
              <h2 class="drawer-title">Admin Management</h2>
              <p class="drawer-sub">Quick CRUD operations & live data control</p>
            </div>
          </div>
          <button
            type="button"
            class="close-btn"
            aria-label="Close admin drawer"
            @click="$emit('close')"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="drawer-tabs">
          <button
            type="button"
            class="drawer-tab"
            :class="{ active: activeTab === 'courses' }"
            @click="activeTab = 'courses'"
          >
            <BookOpen :size="15" />
            <span>Courses ({{ courses.length }})</span>
          </button>
          <button
            type="button"
            class="drawer-tab"
            :class="{ active: activeTab === 'students' }"
            @click="activeTab = 'students'"
          >
            <Users :size="15" />
            <span>Students ({{ students.length }})</span>
          </button>
          <button
            type="button"
            class="drawer-tab"
            :class="{ active: activeTab === 'tools' }"
            @click="activeTab = 'tools'"
          >
            <Sliders :size="15" />
            <span>Quick Ops</span>
          </button>
        </div>

        <!-- Drawer Content -->
        <div class="drawer-body">
          <!-- TAB 1: COURSES CRUD -->
          <div v-if="activeTab === 'courses'" class="tab-content">
            <div class="tab-action-bar">
              <input
                v-model="courseSearch"
                type="text"
                placeholder="Search courses..."
                class="search-mini"
              />
              <button
                type="button"
                class="btn-primary-mini"
                @click="openCreateCourse"
              >
                <Plus :size="14" />
                <span>Add</span>
              </button>
            </div>

            <div class="items-list">
              <div
                v-for="c in filteredCourses"
                :key="c.id"
                class="item-card glass"
              >
                <div class="item-main">
                  <img :src="c.thumbnail" :alt="c.title" class="item-thumb" />
                  <div class="item-info">
                    <span class="item-title">{{ c.title }}</span>
                    <span class="item-meta">
                      ${{ c.price }} • {{ c.totalStudents }} students • {{ c.category }}
                    </span>
                  </div>
                </div>

                <div class="item-actions">
                  <!-- Quick Status Switcher -->
                  <select
                    :value="c.status"
                    class="status-select-mini"
                    :class="`status-${c.status}`"
                    @change="e => updateCourseStatus(c.slug, (e.target as HTMLSelectElement).value)"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>

                  <NuxtLink
                    :to="`/courses/${c.slug}`"
                    class="action-icon-btn"
                    title="View & Edit Full Course"
                    @click="$emit('close')"
                  >
                    <ExternalLink :size="14" />
                  </NuxtLink>

                  <button
                    type="button"
                    class="action-icon-btn text-rose-400 hover:bg-rose-500/20"
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
          <div v-else-if="activeTab === 'students'" class="tab-content">
            <div class="tab-action-bar">
              <input
                v-model="studentSearch"
                type="text"
                placeholder="Search students..."
                class="search-mini"
              />
              <button
                type="button"
                class="btn-primary-mini"
                @click="showAddStudent = !showAddStudent"
              >
                <Plus :size="14" />
                <span>{{ showAddStudent ? 'Close' : 'Add' }}</span>
              </button>
            </div>

            <!-- Inline Quick Add Student Form -->
            <div v-if="showAddStudent" class="quick-add-form glass">
              <h4 class="form-title">Quick Add Student</h4>
              <div class="form-grid">
                <input
                  v-model="newStudent.name"
                  type="text"
                  placeholder="Full Name *"
                  class="search-mini"
                />
                <input
                  v-model="newStudent.email"
                  type="email"
                  placeholder="Email Address *"
                  class="search-mini"
                />
                <input
                  v-model="newStudent.country"
                  type="text"
                  placeholder="Country"
                  class="search-mini"
                />
                <select v-model="newStudent.status" class="search-mini bg-[#12131f]">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                type="button"
                class="btn-primary-mini w-full mt-2"
                :disabled="creatingStudent"
                @click="submitNewStudent"
              >
                <Loader2 v-if="creatingStudent" :size="14" class="animate-spin" />
                <span>{{ creatingStudent ? 'Adding...' : 'Create Student' }}</span>
              </button>
            </div>

            <div class="items-list">
              <div
                v-for="s in filteredStudents"
                :key="s.id"
                class="item-card glass"
              >
                <div class="item-main">
                  <img :src="s.avatar" :alt="s.name" class="student-thumb" />
                  <div class="item-info">
                    <span class="item-title">{{ s.name }}</span>
                    <span class="item-meta">
                      {{ s.email }} • {{ s.country }} • ${{ s.totalSpent.toFixed(2) }}
                    </span>
                  </div>
                </div>

                <div class="item-actions">
                  <!-- Quick Status Toggle -->
                  <button
                    type="button"
                    class="badge-toggle"
                    :class="s.status === 'active' ? 'badge-active' : 'badge-inactive'"
                    @click="toggleStudentStatus(s)"
                  >
                    {{ s.status }}
                  </button>

                  <button
                    type="button"
                    class="action-icon-btn text-rose-400 hover:bg-rose-500/20"
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
          <div v-else class="tab-content">
            <div class="tools-grid">
              <div class="tool-card glass">
                <div class="tool-head">
                  <Sparkles :size="18" class="text-amber-400" />
                  <span class="tool-name">Seed Quick Course</span>
                </div>
                <p class="tool-desc">
                  Generates an instant trending course with mock revenue and lessons into the database.
                </p>
                <button
                  type="button"
                  class="btn-action-tool"
                  :disabled="seeding"
                  @click="seedSampleCourse"
                >
                  <Plus :size="14" />
                  <span>Generate Sample Course</span>
                </button>
              </div>

              <div class="tool-card glass">
                <div class="tool-head">
                  <FileJson :size="18" class="text-blue-400" />
                  <span class="tool-name">Export Database</span>
                </div>
                <p class="tool-desc">
                  Download a snapshot of the current local mock database as a JSON backup file.
                </p>
                <button
                  type="button"
                  class="btn-action-tool"
                  @click="downloadDbBackup"
                >
                  <Download :size="14" />
                  <span>Export JSON</span>
                </button>
              </div>
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
  a.download = `academy-database-backup-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function openCreateCourse() {
  emit('close')
  emit('open-create-course')
}
</script>

<style scoped>
.admin-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 90;
}

.admin-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 90vw;
  background: #0d0e18;
  border-left: 1px solid rgba(124, 58, 237, 0.3);
  box-shadow: -15px 0 50px rgba(0, 0, 0, 0.8), -5px 0 25px rgba(124, 58, 237, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.drawer-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 20, 0.5);
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-badge-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
}

.drawer-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.drawer-tabs {
  display: flex;
  padding: 10px 16px;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.drawer-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: none;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.drawer-tab:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.04);
}

.drawer-tab.active {
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.15);
  border-color: rgba(124, 58, 237, 0.35);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
}

.tab-action-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-mini {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
  font-size: 12px;
  outline: none;
  font-family: inherit;
}

.search-mini:focus {
  border-color: rgba(124, 58, 237, 0.5);
}

.btn-primary-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary-mini:hover {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  padding: 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.item-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-thumb {
  width: 48px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.student-thumb {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.status-select-mini {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: #12131f;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.action-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.badge-toggle {
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  cursor: pointer;
  border: none;
}

.badge-active {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.badge-inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.quick-add-form {
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.form-title {
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tools-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tool-card {
  padding: 18px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-name {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
}

.tool-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.5;
}

.btn-action-tool {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.35);
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.btn-action-tool:hover {
  background: rgba(124, 58, 237, 0.3);
  color: #fff;
}

/* Light mode overrides */
html.light .admin-drawer {
  background: #ffffff;
  border-left-color: rgba(124, 58, 237, 0.25);
  box-shadow: -15px 0 50px rgba(0, 0, 0, 0.15), -5px 0 25px rgba(124, 58, 237, 0.1);
}

html.light .drawer-header {
  background: #f8fafc;
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

html.light .drawer-title {
  color: #0f172a;
}

html.light .drawer-sub {
  color: #64748b;
}

html.light .close-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #64748b;
}

html.light .close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

html.light .search-mini {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

html.light .item-title {
  color: #0f172a;
}

html.light .item-meta {
  color: #64748b;
}

html.light .tool-name {
  color: #0f172a;
}

html.light .tool-desc {
  color: #64748b;
}

/* Drawer transitions */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
