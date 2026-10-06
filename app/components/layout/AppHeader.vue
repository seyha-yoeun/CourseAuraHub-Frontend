<template>
  <header class="app-header">
    <div class="header-left">
      <button class="toggle-btn" aria-label="Toggle sidebar" @click="$emit('toggle-sidebar')">
        <Menu :size="20" :stroke-width="1.5" />
      </button>

      <!-- Nuxt UI Breadcrumb -->
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
              {{ item.label }}
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
        type="button"
        class="admin-quick-btn"
        title="Open Admin Management Console (Live CRUD)"
        @click="$emit('open-admin')"
      >
        <ShieldAlert :size="15" class="text-violet-400" />
        <span class="admin-btn-label">Admin CRUD</span>
      </button>

      <!-- Search -->
      <div class="header-search">
        <Search :size="15" class="search-icon" />
        <input placeholder="Search platform..." class="search-input" />
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
      <div class="header-avatar" title="Alex Chen (Admin)" @click="$emit('open-admin')">
        <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexAdmin&backgroundColor=b6e3f4" alt="Profile" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Search, Bell, HelpCircle, ShieldAlert, ChevronRight } from 'lucide-vue-next'

defineProps<{ sidebarCollapsed: boolean }>()
defineEmits(['toggle-sidebar', 'open-admin'])

const route = useRoute()

const breadcrumbItems = computed(() => {
  const path = route.path

  if (path === '/') {
    return [
      { label: 'LearnFlow', to: '/' },
      { label: 'Dashboard' }
    ]
  }

  if (path === '/courses') {
    return [
      { label: 'LearnFlow', to: '/' },
      { label: 'Courses' }
    ]
  }

  if (path.startsWith('/courses/')) {
    const slug = (route.params.slug as string) || path.replace('/courses/', '')
    const formatted = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return [
      { label: 'LearnFlow', to: '/' },
      { label: 'Courses', to: '/courses' },
      { label: formatted }
    ]
  }

  if (path === '/students') {
    return [
      { label: 'LearnFlow', to: '/' },
      { label: 'Students' }
    ]
  }

  if (path === '/analytics') {
    return [
      { label: 'LearnFlow', to: '/' },
      { label: 'Analytics' }
    ]
  }

  if (path === '/settings') {
    return [
      { label: 'LearnFlow', to: '/' },
      { label: 'Settings' }
    ]
  }

  const segment = path.replace(/^\//, '').replace(/-/g, ' ')
  return [
    { label: 'LearnFlow', to: '/' },
    { label: segment.charAt(0).toUpperCase() + segment.slice(1) }
  ]
})
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(10, 10, 20, 0.85);
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
  min-width: 0;
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
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
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

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.15s ease;
}

.breadcrumb-link:hover {
  color: #a78bfa;
}

.breadcrumb-sep-icon {
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.breadcrumb-current {
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 600;
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

.admin-quick-btn:hover {
  background: rgba(124, 58, 237, 0.3);
  color: #fff;
  border-color: rgba(124, 58, 237, 0.6);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.25);
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
  width: 200px;
  padding: 7px 12px 7px 32px;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.header-avatar:hover { border-color: #7c3aed; }

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 14px;
  }
  .header-search {
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
