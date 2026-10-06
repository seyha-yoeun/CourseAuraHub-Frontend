<template>
  <header class="app-header">
    <div class="header-left">
      <button class="toggle-btn" aria-label="Toggle sidebar" @click="$emit('toggle-sidebar')">
        <Menu :size="20" :stroke-width="1.5" />
      </button>

      <div class="breadcrumb">
        <span class="breadcrumb-root">LearnFlow</span>
        <ChevronRight :size="14" class="breadcrumb-sep" />
        <span class="breadcrumb-current">{{ pageTitle }}</span>
      </div>
    </div>

    <div class="header-right">
      <!-- Search -->
      <div class="header-search">
        <Search :size="15" class="search-icon" />
        <input placeholder="Search courses, students..." class="search-input" />
      </div>

      <!-- Notifications -->
      <button class="icon-btn" aria-label="Notifications">
        <Bell :size="18" :stroke-width="1.5" />
        <span class="notif-dot"></span>
      </button>

      <!-- Help -->
      <button class="icon-btn" aria-label="Help">
        <HelpCircle :size="18" :stroke-width="1.5" />
      </button>

      <!-- Avatar -->
      <div class="header-avatar">
        <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexAdmin&backgroundColor=b6e3f4" alt="Profile" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, ChevronRight, Search, Bell, HelpCircle } from 'lucide-vue-next'

defineProps<{ sidebarCollapsed: boolean }>()
defineEmits(['toggle-sidebar'])

const route = useRoute()
const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/': 'Dashboard Overview',
    '/courses': 'Course Management',
    '/students': 'Student Management',
    '/settings': 'Platform Settings',
    '/analytics': 'Analytics',
  }
  if (route.path.startsWith('/courses/')) return 'Course Detail'
  return map[route.path] || 'Dashboard'
})
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(10, 10, 20, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.breadcrumb-root { color: rgba(255, 255, 255, 0.4); }
.breadcrumb-sep { color: rgba(255, 255, 255, 0.25); }
.breadcrumb-current {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: rgba(255, 255, 255, 0.3);
}

.search-input {
  width: 220px;
  padding: 8px 12px 8px 32px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.search-input::placeholder { color: rgba(255, 255, 255, 0.25); }
.search-input:focus {
  border-color: rgba(124, 58, 237, 0.4);
  background: rgba(255, 255, 255, 0.06);
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  background: #7c3aed;
  border-radius: 50%;
  border: 1.5px solid #0a0a0f;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.5);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.header-avatar:hover { border-color: #7c3aed; }

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
