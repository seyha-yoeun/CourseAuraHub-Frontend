<template>
  <aside class="sidebar" :class="{ collapsed }">
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
          <span class="logo-name">LearnFlow</span>
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

    <!-- Bottom profile -->
    <div class="sidebar-profile">
      <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexAdmin&backgroundColor=b6e3f4" alt="Avatar" class="profile-avatar" />
      <Transition name="fade-text">
        <div v-if="!collapsed" class="profile-info">
          <p class="profile-name">Alex Chen</p>
          <p class="profile-role">Platform Admin</p>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  GraduationCap,
} from 'lucide-vue-next'

defineProps<{ collapsed: boolean }>()
defineEmits(['toggle'])

const route = useRoute()

const navSections = [
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
      { to: '/courses', label: 'Courses', icon: BookOpen, badge: '6' },
      { to: '/students', label: 'Students', icon: GraduationCap, badge: '10' },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<style scoped>
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
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Profile */
.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 72px;
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
</style>
