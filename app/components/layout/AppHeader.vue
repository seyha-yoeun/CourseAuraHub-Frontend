<template>
  <header class="app-header">
    <div class="header-left">
      <button
        class="toggle-btn"
        aria-label="Toggle sidebar"
        title="Toggle Sidebar (Ctrl+B)"
        @click="$emit('toggle-sidebar')"
      >
        <Menu :size="20" :stroke-width="1.5" />
      </button>

      <!-- Breadcrumb with CourseAuraHub Academy branding and high contrast -->
      <nav aria-label="Breadcrumb" class="breadcrumb-container">
        <UBreadcrumb :items="breadcrumbItems" class="custom-breadcrumb">
          <template #separator>
            <ChevronRight :size="13" class="breadcrumb-sep-icon" />
          </template>
          <template #default="{ item, index }">
            <NuxtLink
              v-if="item.to && index < breadcrumbItems.length - 1"
              :to="item.to"
              class="breadcrumb-link"
            >
              <span v-if="index === 0" class="brand-crumb">
                <span class="brand-aura">CourseAuraHub</span>
                <span class="brand-tag">Academy</span>
              </span>
              <span v-else>{{ item.label }}</span>
            </NuxtLink>
            <span v-else class="breadcrumb-current">
              {{ item.label }}
            </span>
          </template>
        </UBreadcrumb>
      </nav>
    </div>

    <div class="header-right">
      <!-- Admin Management Trigger -->
      <button
        v-if="auth.isAdmin"
        type="button"
        class="admin-quick-btn"
        title="Open Admin Management Console (Live CRUD)"
        @click="$emit('open-admin')"
      >
        <ShieldAlert :size="15" class="text-violet-400" />
        <span class="admin-btn-label">Admin CRUD</span>
      </button>

      <!-- Functional Search Bar with Instant Results Dropdown -->
      <div ref="searchContainerRef" class="header-search-wrap">
        <div class="header-search">
          <Search :size="15" class="search-icon" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search platform... (Ctrl+K)"
            class="search-input"
            @focus="isSearchFocused = true"
            @keydown.esc="closeSearch"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="clear-search-btn"
            aria-label="Clear search"
            @click="clearSearch"
          >
            <X :size="13" />
          </button>
        </div>

        <!-- Search Results Dropdown -->
        <Transition name="dropdown-anim">
          <div
            v-if="isSearchFocused && searchQuery.trim().length > 0"
            class="search-dropdown glass"
          >
            <div class="search-results-scroll">
              <!-- Courses Group -->
              <div v-if="filteredCourses.length > 0" class="search-group">
                <div class="group-header">
                  <BookOpen :size="13" class="text-violet-400" />
                  <span>Courses ({{ filteredCourses.length }})</span>
                </div>
                <button
                  v-for="course in filteredCourses"
                  :key="course.id"
                  type="button"
                  class="search-result-item"
                  @click="goToCourse(course.slug)"
                >
                  <img :src="course.thumbnail" :alt="course.title" class="result-thumb" />
                  <div class="result-meta">
                    <span class="result-title">{{ course.title }}</span>
                    <span class="result-sub">{{ course.category }} • by {{ course.instructor }}</span>
                  </div>
                  <span class="result-price">${{ course.price.toFixed(2) }}</span>
                </button>
              </div>

              <!-- Students Group -->
              <div v-if="filteredStudents.length > 0" class="search-group">
                <div class="group-header">
                  <Users :size="13" class="text-blue-400" />
                  <span>Students ({{ filteredStudents.length }})</span>
                </div>
                <button
                  v-for="student in filteredStudents"
                  :key="student.id"
                  type="button"
                  class="search-result-item"
                  @click="goToStudents"
                >
                  <img :src="student.avatar" :alt="student.name" class="result-avatar" />
                  <div class="result-meta">
                    <span class="result-title">{{ student.name }}</span>
                    <span class="result-sub">{{ student.email }} • {{ student.country }}</span>
                  </div>
                  <span class="result-badge">{{ student.status }}</span>
                </button>
              </div>

              <!-- Quick Navigation Pages Group -->
              <div v-if="filteredPages.length > 0" class="search-group">
                <div class="group-header">
                  <Compass :size="13" class="text-emerald-400" />
                  <span>Navigation Pages</span>
                </div>
                <button
                  v-for="page in filteredPages"
                  :key="page.to"
                  type="button"
                  class="search-result-item"
                  @click="goToPage(page)"
                >
                  <component :is="page.icon" :size="15" class="text-violet-400" />
                  <div class="result-meta">
                    <span class="result-title">{{ page.name }}</span>
                    <span class="result-sub">{{ page.desc }}</span>
                  </div>
                </button>
              </div>

              <!-- No Results State -->
              <div
                v-if="filteredCourses.length === 0 && filteredStudents.length === 0 && filteredPages.length === 0"
                class="search-empty"
              >
                <SearchX :size="20" class="text-muted" />
                <p>No results found for "{{ searchQuery }}"</p>
                <span class="text-xs text-muted">Try searching for "Nuxt", "Vue", "Alex", or "Analytics"</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Theme (Dark / Light Mode) Toggle -->
      <button
        type="button"
        class="icon-btn theme-toggle-btn"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        aria-label="Toggle Dark and Light Mode"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" :size="18" :stroke-width="1.6" class="text-amber-400 animate-spin-once" />
        <Moon v-else :size="18" :stroke-width="1.6" class="text-indigo-400 animate-spin-once" />
      </button>

      <!-- Notifications with Dropdown -->
      <div ref="notifContainerRef" class="relative">
        <button
          type="button"
          class="icon-btn"
          :class="{ 'btn-active': isNotifOpen }"
          aria-label="Notifications"
          title="Notifications"
          @click="toggleNotif"
        >
          <Bell :size="18" :stroke-width="1.5" />
          <span v-if="unreadNotifsCount > 0" class="notif-dot"></span>
        </button>

        <!-- Notifications Dropdown -->
        <Transition name="dropdown-anim">
          <div v-if="isNotifOpen" class="notif-dropdown glass">
            <!-- Header -->
            <div class="dropdown-top-bar">
              <div class="flex items-center gap-2">
                <span class="dropdown-title">Notifications</span>
                <span v-if="unreadNotifsCount > 0" class="unread-pill">{{ unreadNotifsCount }} new</span>
              </div>
              <button
                v-if="unreadNotifsCount > 0"
                type="button"
                class="mark-all-read-btn"
                @click="markAllAsRead"
              >
                Mark all read
              </button>
            </div>

            <!-- List -->
            <div class="notif-list-scroll">
              <div
                v-for="notif in notifications"
                :key="notif.id"
                class="notif-item"
                :class="{ 'is-unread': !notif.read }"
                @click="markItemRead(notif)"
              >
                <div class="notif-icon-wrap" :style="{ background: notif.colorBg }">
                  <component :is="notif.icon" :size="15" :style="{ color: notif.color }" />
                </div>
                <div class="notif-content">
                  <p class="notif-text">{{ notif.title }}</p>
                  <span class="notif-time">{{ notif.time }}</span>
                </div>
                <span v-if="!notif.read" class="unread-indicator-dot"></span>
              </div>
            </div>

            <!-- Footer link -->
            <div class="notif-footer">
              <NuxtLink to="/analytics" class="notif-link" @click="isNotifOpen = false">
                <span>View Full Analytics Activity</span>
                <ArrowRight :size="12" />
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Help with Modal Trigger -->
      <button
        type="button"
        class="icon-btn"
        aria-label="Help & About Platform"
        title="Help & Platform Guide (Ctrl+H)"
        @click="isHelpOpen = true"
      >
        <HelpCircle :size="18" :stroke-width="1.5" />
      </button>

      <!-- Avatar with User Dropdown -->
      <div ref="avatarContainerRef" class="relative">
        <div
          class="header-avatar"
          :class="{ 'avatar-active': isAvatarOpen }"
          :title="`${auth.userName} (${auth.roleLabel})`"
          @click="toggleAvatar"
        >
          <img :src="auth.userAvatar" :alt="`${auth.userName} profile`" />
        </div>

        <!-- Avatar Dropdown Menu -->
        <Transition name="dropdown-anim">
          <div v-if="isAvatarOpen" class="avatar-dropdown glass">
            <!-- User Summary Header -->
            <div class="avatar-user-card">
              <div class="relative">
                <img
                  :src="auth.userAvatar"
                  :alt="auth.userName"
                  class="user-card-avatar"
                />
                <span class="online-indicator"></span>
              </div>
              <div class="user-card-meta">
                <span class="user-card-name">{{ auth.userName }}</span>
                <span class="user-card-email">{{ auth.userEmail }}</span>
                <span class="user-card-badge">{{ auth.roleLabel }}</span>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Navigation Links -->
            <div class="avatar-menu-list">
              <button
                v-if="auth.isAdmin"
                type="button"
                class="avatar-menu-item"
                @click="handleOpenAdmin"
              >
                <ShieldAlert :size="15" class="text-violet-400" />
                <span>Admin CRUD Console</span>
                <span class="item-tag-live">Live</span>
              </button>

              <NuxtLink
                to="/courses"
                class="avatar-menu-item"
                @click="isAvatarOpen = false"
              >
                <BookOpen :size="15" class="text-blue-400" />
                <span>Course Catalog</span>
              </NuxtLink>

              <NuxtLink
                v-if="auth.isAdmin"
                to="/students"
                class="avatar-menu-item"
                @click="isAvatarOpen = false"
              >
                <Users :size="15" class="text-emerald-400" />
                <span>Students Roster</span>
              </NuxtLink>

              <NuxtLink
                v-if="auth.isAdmin"
                to="/analytics"
                class="avatar-menu-item"
                @click="isAvatarOpen = false"
              >
                <BarChart3 :size="15" class="text-amber-400" />
                <span>Sales Analytics</span>
              </NuxtLink>

              <NuxtLink
                v-if="auth.isAdmin"
                to="/settings"
                class="avatar-menu-item"
                @click="isAvatarOpen = false"
              >
                <Settings :size="15" class="text-purple-400" />
                <span>Platform Settings</span>
              </NuxtLink>

              <button
                type="button"
                class="avatar-menu-item"
                @click="handleOpenHelp"
              >
                <HelpCircle :size="15" class="text-teal-400" />
                <span>Platform Help & Guide</span>
              </button>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Quick Theme Switch Row inside Dropdown -->
            <div class="avatar-theme-row">
              <span class="text-xs text-muted">Appearance</span>
              <button
                type="button"
                class="theme-mini-switch"
                @click="toggleTheme"
              >
                <Sun v-if="!isDark" :size="13" class="text-amber-400" />
                <Moon v-else :size="13" class="text-indigo-400" />
                <span>{{ isDark ? 'Dark Theme' : 'Light Theme' }}</span>
              </button>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Logout Button -->
            <button
              type="button"
              class="avatar-logout-btn"
              @click="handleLogout"
            >
              <LogOut :size="15" class="text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Help Modal Dialog -->
    <AppHelpModal
      :is-open="isHelpOpen"
      @close="isHelpOpen = false"
    />
  </header>
</template>

<script setup lang="ts">
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Settings,
  BookOpen,
  Users,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Star,
  RefreshCw,
  Compass,
  SearchX,
  X,
  ArrowRight
} from 'lucide-vue-next'
import AppHelpModal from '~/components/shared/AppHelpModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useAuth } from '~/composables/useAuth'
import type { Course, Student } from '~/types'

defineProps<{ sidebarCollapsed: boolean }>()
const emit = defineEmits(['toggle-sidebar', 'open-admin'])

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()
const auth = useAuth()
const { info } = useAppToast()

// Dropdown and modal states
const isNotifOpen = ref(false)
const isAvatarOpen = ref(false)
const isHelpOpen = ref(false)

// Search state
const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchContainerRef = ref<HTMLElement | null>(null)
const notifContainerRef = ref<HTMLElement | null>(null)
const avatarContainerRef = ref<HTMLElement | null>(null)

// Dark/Light mode computed
const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  const nextMode = isDark.value ? 'light' : 'dark'
  colorMode.preference = nextMode
  info(`Theme Switched`, `Switched to ${nextMode.toUpperCase()} mode`)
}

// Breadcrumb items with CourseAuraHub branding
const breadcrumbItems = computed(() => {
  const path = route.path

  if (path === '/') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Dashboard' }
    ]
  }

  if (path === '/courses') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Courses' }
    ]
  }

  if (path.startsWith('/courses/')) {
    const slug = (route.params.slug as string) || path.replace('/courses/', '')
    const formatted = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Courses', to: '/courses' },
      { label: formatted }
    ]
  }

  if (path === '/students') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Students' }
    ]
  }

  if (path === '/analytics') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Analytics' }
    ]
  }

  if (path === '/settings') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Settings' }
    ]
  }

  const segment = path.replace(/^\//, '').replace(/-/g, ' ')
  return [
    { label: 'CourseAuraHub', to: '/' },
    { label: segment.charAt(0).toUpperCase() + segment.slice(1) }
  ]
})

// Mock notifications state
const notifications = ref([
  {
    id: 1,
    title: 'Sarah Miller enrolled in Vue 3 Full-Stack Architecture ($89.99)',
    time: '5 mins ago',
    icon: CheckCircle2,
    color: '#34d399',
    colorBg: 'rgba(52, 211, 153, 0.15)',
    read: false
  },
  {
    id: 2,
    title: 'David Kim left a 5-star review on Advanced Pinia Patterns',
    time: '42 mins ago',
    icon: Star,
    color: '#fbbf24',
    colorBg: 'rgba(251, 191, 36, 0.15)',
    read: false
  },
  {
    id: 3,
    title: 'Revenue Milestone: Monthly course sales reached $12,500 target!',
    time: '2 hours ago',
    icon: TrendingUp,
    color: '#8b5cf6',
    colorBg: 'rgba(139, 92, 246, 0.15)',
    read: false
  },
  {
    id: 4,
    title: 'Catalog updated: New course drafted in Web Development',
    time: '1 day ago',
    icon: RefreshCw,
    color: '#60a5fa',
    colorBg: 'rgba(96, 165, 250, 0.15)',
    read: true
  }
])

const unreadNotifsCount = computed(() => notifications.value.filter(n => !n.read).length)

function toggleNotif() {
  isNotifOpen.value = !isNotifOpen.value
  if (isNotifOpen.value) {
    isAvatarOpen.value = false
    isSearchFocused.value = false
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => (n.read = true))
  info('Notifications Updated', 'All notifications marked as read')
}

function markItemRead(item: (typeof notifications.value)[0]) {
  item.read = true
}

// Avatar dropdown triggers
function toggleAvatar() {
  isAvatarOpen.value = !isAvatarOpen.value
  if (isAvatarOpen.value) {
    isNotifOpen.value = false
    isSearchFocused.value = false
  }
}

function handleOpenAdmin() {
  isAvatarOpen.value = false
  emit('open-admin')
}

function handleOpenHelp() {
  isAvatarOpen.value = false
  isHelpOpen.value = true
}

async function handleLogout() {
  isAvatarOpen.value = false
  await auth.logout()
}

// Fetch search datasets (courses & students)
const allCourses = ref<Course[]>([])
const allStudents = ref<Student[]>([])

async function loadSearchData() {
  try {
    const coursesPromise = $fetch<Course[]>('/api/courses').catch(() => [])
    const studentsPromise = auth.isAdmin
      ? $fetch<Student[]>('/api/students').catch(() => [])
      : Promise.resolve([])

    const [courses, students] = await Promise.all([coursesPromise, studentsPromise])
    allCourses.value = courses || []
    allStudents.value = students || []
  } catch (error) {
    console.error('Unable to load search data:', error)
  }
}

onMounted(() => {
  loadSearchData()
})

watch(() => auth.isAdmin, () => {
  loadSearchData()
})

const quickPages = [
  { name: 'Dashboard Overview', desc: 'Main sales KPIs, chart breakdowns, and metrics', to: '/', icon: BarChart3 },
  { name: 'Course Catalog & CRUD', desc: 'Manage curriculum, edit pricing, and publish courses', to: '/courses', icon: BookOpen },
  { name: 'Student Directory', desc: 'Active learners, enrollment dates, and lifetime spend', to: '/students', icon: Users },
  { name: 'Sales & Analytics', desc: 'Detailed financial and performance reports', to: '/analytics', icon: TrendingUp },
  { name: 'Platform Settings', desc: 'Storefront branding, preferences, and profile', to: '/settings', icon: Settings },
  { name: 'Admin Live Console', desc: 'Quick drawer operations, status toggles, and tools', to: 'admin', icon: ShieldAlert },
]

const filteredCourses = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return allCourses.value
    .filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    )
    .slice(0, 4)
})

const filteredStudents = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return allStudents.value
    .filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    )
    .slice(0, 3)
})

const filteredPages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return quickPages
    .filter(page => auth.isAdmin || page.to === '/courses')
    .filter(p =>
      p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    )
    .slice(0, 3)
})

function closeSearch() {
  isSearchFocused.value = false
}

function clearSearch() {
  searchQuery.value = ''
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

function goToCourse(slug: string) {
  closeSearch()
  searchQuery.value = ''
  router.push(`/courses/${slug}`)
}

function goToStudents() {
  closeSearch()
  searchQuery.value = ''
  router.push('/students')
}

function goToPage(page: typeof quickPages[0]) {
  closeSearch()
  searchQuery.value = ''
  if (page.to === 'admin') {
    emit('open-admin')
  } else {
    router.push(page.to)
  }
}

// Global click-outside handling
function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node

  if (notifContainerRef.value && !notifContainerRef.value.contains(target)) {
    isNotifOpen.value = false
  }

  if (avatarContainerRef.value && !avatarContainerRef.value.contains(target)) {
    isAvatarOpen.value = false
  }

  if (searchContainerRef.value && !searchContainerRef.value.contains(target)) {
    isSearchFocused.value = false
  }
}

// Keyboard shortcuts (Ctrl+K or '/' to focus search, Ctrl+H for help)
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchInputRef.value?.focus()
    isSearchFocused.value = true
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    e.preventDefault()
    isHelpOpen.value = !isHelpOpen.value
  } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault()
    searchInputRef.value?.focus()
    isSearchFocused.value = true
  } else if (e.key === 'Escape') {
    isNotifOpen.value = false
    isAvatarOpen.value = false
    isSearchFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--header-bg, rgba(10, 10, 20, 0.85));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  position: sticky;
  top: 0;
  z-index: 40;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

html.light .app-header {
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  background: var(--bg-input, rgba(255, 255, 255, 0.04));
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

html.light .toggle-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
}

.toggle-btn:hover {
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.08));
  color: var(--text-primary, #fff);
  border-color: rgba(124, 58, 237, 0.4);
}

html.light .toggle-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
}

.custom-breadcrumb :deep(ol) {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.custom-breadcrumb :deep(li) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.brand-crumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.brand-aura {
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  letter-spacing: -0.3px;
}

html.light .brand-aura {
  color: #0f172a;
}

.brand-tag {
  font-size: 10px;
  font-weight: 700;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.25);
  padding: 1px 6px;
  border-radius: 99px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.breadcrumb-link {
  color: var(--text-secondary, rgba(255, 255, 255, 0.65));
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.15s ease;
}

html.light .breadcrumb-link {
  color: #475569;
}

.breadcrumb-link:hover {
  color: #a78bfa;
}

html.light .breadcrumb-link:hover {
  color: #7c3aed;
}

.breadcrumb-sep-icon {
  color: var(--text-muted, rgba(255, 255, 255, 0.35));
  flex-shrink: 0;
}

html.light .breadcrumb-sep-icon {
  color: #94a3b8;
}

.breadcrumb-current {
  color: var(--text-primary, #f8fafc);
  font-size: 13px;
  font-weight: 600;
}

html.light .breadcrumb-current {
  color: #0f172a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.35);
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

html.light .admin-quick-btn {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.3);
  color: #6d28d9;
}

.admin-quick-btn:hover {
  background: rgba(124, 58, 237, 0.3);
  color: #fff;
  border-color: rgba(124, 58, 237, 0.6);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.25);
}

/* Search Bar */
.header-search-wrap {
  position: relative;
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-muted, rgba(255, 255, 255, 0.35));
  pointer-events: none;
}

html.light .search-icon {
  color: #94a3b8;
}

.search-input {
  width: 220px;
  padding: 7px 28px 7px 32px;
  background: var(--bg-input, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary, rgba(255, 255, 255, 0.85));
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

html.light .search-input {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #0f172a;
}

.search-input::placeholder {
  color: var(--text-muted, rgba(255, 255, 255, 0.3));
}

html.light .search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  width: 260px;
  border-color: rgba(124, 58, 237, 0.6);
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.07));
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
}

html.light .search-input:focus {
  background: #ffffff;
  border-color: #7c3aed;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 4px;
}

.clear-search-btn:hover {
  color: var(--text-primary, #fff);
}

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 380px;
  background: #0f101b;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(124, 58, 237, 0.15);
  z-index: 60;
  overflow: hidden;
}

html.light .search-dropdown {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.25);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(124, 58, 237, 0.1);
}

.search-results-scroll {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
  letter-spacing: 0.5px;
}

html.light .group-header {
  color: #64748b;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: none;
  border: 1px solid transparent;
  color: var(--text-primary, #f1f5f9);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  width: 100%;
}

html.light .search-result-item {
  color: #0f172a;
}

.search-result-item:hover {
  background: rgba(124, 58, 237, 0.15);
  border-color: rgba(124, 58, 237, 0.3);
}

html.light .search-result-item:hover {
  background: #f5f3ff;
  border-color: rgba(124, 58, 237, 0.3);
}

.result-thumb {
  width: 36px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.result-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.result-meta {
  flex: 1;
  min-width: 0;
}

.result-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.light .result-title {
  color: #0f172a;
}

.result-sub {
  display: block;
  font-size: 11px;
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 1px;
}

html.light .result-sub {
  color: #64748b;
}

.result-price {
  font-size: 12px;
  font-weight: 700;
  color: #34d399;
}

.result-badge {
  font-size: 10px;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 99px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.search-empty {
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text-muted, rgba(255, 255, 255, 0.5));
  font-size: 13px;
}

/* Icon Buttons */
.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  background: var(--bg-input, rgba(255, 255, 255, 0.04));
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  flex-shrink: 0;
}

html.light .icon-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
}

.icon-btn:hover,
.icon-btn.btn-active {
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.08));
  color: var(--text-primary, #fff);
  border-color: rgba(124, 58, 237, 0.4);
}

html.light .icon-btn:hover,
html.light .icon-btn.btn-active {
  background: #e2e8f0;
  color: #0f172a;
}

.theme-toggle-btn:hover {
  transform: rotate(15deg);
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  background: #7c3aed;
  border-radius: 50%;
  border: 1.5px solid #0a0a0f;
  animation: pulse-soft 2s infinite;
}

html.light .notif-dot {
  border-color: #ffffff;
}

/* Notifications Dropdown */
.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  background: #0f101b;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.15);
  z-index: 60;
  overflow: hidden;
}

html.light .notif-dropdown {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.25);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12), 0 0 25px rgba(124, 58, 237, 0.1);
}

.dropdown-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

html.light .dropdown-top-bar {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.dropdown-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
}

html.light .dropdown-title {
  color: #0f172a;
}

.unread-pill {
  font-size: 10px;
  font-weight: 700;
  background: rgba(124, 58, 237, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(124, 58, 237, 0.35);
  padding: 2px 7px;
  border-radius: 99px;
}

html.light .unread-pill {
  color: #6d28d9;
  background: #ede9fe;
}

.mark-all-read-btn {
  font-size: 11px;
  font-weight: 600;
  color: #a78bfa;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.mark-all-read-btn:hover {
  color: #c4b5fd;
  text-decoration: underline;
}

.notif-list-scroll {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
}

html.light .notif-item {
  border-bottom-color: rgba(0, 0, 0, 0.04);
}

.notif-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

html.light .notif-item:hover {
  background: #f8fafc;
}

.notif-item.is-unread {
  background: rgba(124, 58, 237, 0.07);
}

html.light .notif-item.is-unread {
  background: #faf5ff;
}

.notif-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-content {
  flex: 1;
}

.notif-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary, #e2e8f0);
  line-height: 1.4;
}

html.light .notif-text {
  color: #1e293b;
}

.notif-time {
  display: block;
  font-size: 10px;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  margin-top: 4px;
}

html.light .notif-time {
  color: #94a3b8;
}

.unread-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7c3aed;
  margin-top: 6px;
  flex-shrink: 0;
}

.notif-footer {
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}

html.light .notif-footer {
  background: #f8fafc;
  border-top-color: rgba(0, 0, 0, 0.06);
}

.notif-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #a78bfa;
  text-decoration: none;
  transition: all 0.15s;
}

.notif-link:hover {
  color: #c4b5fd;
}

/* Avatar & Dropdown */
.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.5);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.header-avatar:hover,
.header-avatar.avatar-active {
  border-color: #7c3aed;
  box-shadow: 0 0 14px rgba(124, 58, 237, 0.5);
  transform: scale(1.05);
}

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 270px;
  background: #0f101b;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.15);
  z-index: 60;
  padding: 8px;
  overflow: hidden;
}

html.light .avatar-dropdown {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.25);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12), 0 0 25px rgba(124, 58, 237, 0.1);
}

.avatar-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 12px;
}

.user-card-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.4);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #0f101b;
}

html.light .online-indicator {
  border-color: #ffffff;
}

.user-card-meta {
  flex: 1;
  min-width: 0;
}

.user-card-name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
}

html.light .user-card-name {
  color: #0f172a;
}

.user-card-email {
  display: block;
  font-size: 11px;
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.light .user-card-email {
  color: #64748b;
}

.user-card-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #a78bfa;
  background: rgba(124, 58, 237, 0.18);
  border: 1px solid rgba(124, 58, 237, 0.3);
  padding: 1px 6px;
  border-radius: 99px;
  margin-top: 3px;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
}

html.light .dropdown-divider {
  background: rgba(0, 0, 0, 0.06);
}

.avatar-menu-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.avatar-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  background: none;
  border: none;
  color: var(--text-secondary, rgba(255, 255, 255, 0.75));
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-align: left;
}

html.light .avatar-menu-item {
  color: #334155;
}

.avatar-menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary, #ffffff);
}

html.light .avatar-menu-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.item-tag-live {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.25);
  padding: 1px 6px;
  border-radius: 99px;
}

.avatar-theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
}

.theme-mini-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #f1f5f9);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

html.light .theme-mini-switch {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.theme-mini-switch:hover {
  background: rgba(124, 58, 237, 0.2);
  border-color: rgba(124, 58, 237, 0.4);
}

.avatar-logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  background: none;
  border: none;
  color: #f87171;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  margin-top: 2px;
}

.avatar-logout-btn:hover {
  background: rgba(244, 63, 94, 0.12);
  color: #fb7185;
}

/* Smooth Dropdown Transitions */
.dropdown-anim-enter-active,
.dropdown-anim-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-anim-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

@media (max-width: 840px) {
  .app-header {
    padding: 0 14px;
  }
  .header-search-wrap {
    display: none;
  }
  .admin-btn-label {
    display: none;
  }
  .admin-quick-btn {
    padding: 6px 8px;
  }
}
</style>
