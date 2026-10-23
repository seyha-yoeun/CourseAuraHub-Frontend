<template>
  <div>
    <!-- Mobile Backdrop -->
    <Transition name="fade-backdrop">
      <div
        v-if="mobileOpen"
        class="sidebar-backdrop"
        @click="$emit('close-mobile')"
      ></div>
    </Transition>

    <aside class="sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 9V19L14 26L2 19V9L14 2Z" fill="url(#logoGrad)" />
            <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="rgba(255,255,255,0.15)" />
            <defs>
              <linearGradient id="logoGrad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stop-color="#7c3aed"/>
                <stop offset="1" stop-color="#2563eb"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <Transition name="fade-text">
          <div v-if="!collapsed" class="logo-text">
            <span class="logo-name">CourseAuraHub</span>
            <span class="logo-tag">Academy</span>
          </div>
        </Transition>
      </div>

      <nav class="sidebar-nav">
        <div v-for="section in navSections" :key="section.label" class="nav-section">
          <Transition name="fade-text">
            <p v-if="!collapsed" class="nav-section-label">{{ section.label }}</p>
          </Transition>
          <NuxtLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ 'sidebar-active': isActive(item.to) }"
            @click="$emit('close-mobile')"
          >
            <component :is="item.icon" :size="20" class="nav-icon" :stroke-width="1.5" />
            <Transition name="fade-text">
              <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
            </Transition>
            <Transition name="fade-text">
              <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
            </Transition>
          </NuxtLink>
        </div>
      </nav>

      <!-- Admin Quick Console Trigger -->
      <div v-if="auth.isAdmin" class="sidebar-admin-section">
        <button
          type="button"
          class="admin-trigger-btn"
          :class="{ 'admin-collapsed': collapsed }"
          title="Open Admin Management Console"
          @click="$emit('open-admin')"
        >
          <ShieldAlert :size="18" class="text-violet-400 flex-shrink-0" />
          <Transition name="fade-text">
            <span v-if="!collapsed" class="admin-trigger-text">Admin Console</span>
          </Transition>
        </button>
      </div>

      <!-- Bottom profile -->
      <div class="sidebar-profile" @click="handleProfileClick">
        <img
          :src="auth.userAvatar"
          :alt="`${auth.userName} profile`"
          class="profile-avatar"
        />
        <Transition name="fade-text">
          <div v-if="!collapsed" class="profile-info">
            <p class="profile-name">{{ auth.userName }}</p>
            <p class="profile-role">{{ auth.roleLabel }}</p>
          </div>
        </Transition>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  BarChart3,
  GraduationCap,
  ShieldAlert
} from 'lucide-vue-next'

withDefaults(
  defineProps<{
    collapsed: boolean
    mobileOpen?: boolean
  }>(),
  {
    mobileOpen: false
  }
)

const emit = defineEmits(['toggle', 'close-mobile', 'open-admin'])

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const navSections = computed(() => {
  if (!auth.isAdmin) {
    return [
      {
        label: 'Learning',
        items: [
          { to: '/courses', label: 'Courses', icon: BookOpen },
        ],
      },
    ]
  }

  return [
    {
      label: 'Overview',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'Management',
      items: [
        { to: '/courses', label: 'Courses', icon: BookOpen },
        { to: '/students', label: 'Students', icon: GraduationCap },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ]
})

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

function handleProfileClick() {
  if (auth.isAdmin) {
    emit('open-admin')
    return
  }

  router.push('/courses')
}
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 45;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: rgba(10, 10, 20, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 72px;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 72px;
}

.logo-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.15);
  border-radius: 10px;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.logo-text { line-height: 1; }
.logo-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.3px;
}
.logo-tag {
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: #7c3aed;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 16px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section {
  margin-bottom: 8px;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  padding: 8px 10px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.nav-icon { flex-shrink: 0; }

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.nav-badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  background: rgba(124, 58, 237, 0.2);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 20px;
  padding: 1px 7px;
}

/* Admin trigger */
.sidebar-admin-section {
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.admin-trigger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.25);
  color: #c4b5fd;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  white-space: nowrap;
  font-family: inherit;
}

.admin-trigger-btn:hover {
  background: rgba(124, 58, 237, 0.25);
  color: #fff;
  border-color: rgba(124, 58, 237, 0.5);
}

.admin-trigger-btn.admin-collapsed {
  justify-content: center;
  padding: 9px;
}

/* Profile */
.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 72px;
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar-profile:hover {
  background: rgba(255, 255, 255, 0.03);
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.4);
  flex-shrink: 0;
  background: #1a1a2e;
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.profile-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 1px;
}

/* Transitions */
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.2s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}

.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: var(--sidebar-width) !important;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.7);
  }
}

/* Light mode overrides */
html.light .sidebar {
  background: rgba(255, 255, 255, 0.98);
  border-right-color: rgba(0, 0, 0, 0.08);
}

html.light .sidebar-logo {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

html.light .logo-name {
  color: #0f172a;
}

html.light .nav-section-label {
  color: #94a3b8;
}

html.light .nav-item {
  color: #475569;
}

html.light .nav-item:hover {
  color: #0f172a;
  background: #f1f5f9;
}

html.light .sidebar-active {
  background: rgba(124, 58, 237, 0.12) !important;
  border-color: rgba(124, 58, 237, 0.3) !important;
  color: #7c3aed !important;
}

html.light .sidebar-profile {
  border-top-color: rgba(0, 0, 0, 0.08);
}

html.light .sidebar-profile:hover {
  background: #f8fafc;
}

html.light .profile-name {
  color: #0f172a;
}

html.light .profile-role {
  color: #64748b;
}
</style>
