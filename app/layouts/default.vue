<template>
<<<<<<< HEAD
  <div v-if="!isHydrated || !auth.initialized" class="auth-boot-screen">
    <div class="auth-boot-spinner" />
    <p>Restoring your session...</p>
  </div>

  <div v-else class="default-layout">
=======
  <div class="relative flex min-h-dvh overflow-x-hidden bg-zinc-950 light:bg-slate-50">
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
    <!-- Background glowing orbs -->
    <div class="pointer-events-none fixed -top-50 -left-50 z-0 size-150 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent_70%)] blur-[80px]" />
    <div class="pointer-events-none fixed top-1/2 -right-[150px] z-0 size-125 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.06),transparent_70%)] blur-[80px]" />
    <div class="pointer-events-none fixed -bottom-25 left-[40%] z-0 size-100 rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.05),transparent_70%)] blur-[80px]" />

    <!-- Sidebar with desktop collapse + mobile drawer -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @toggle="toggleSidebar"
      @close-mobile="mobileSidebarOpen = false"
      @open-admin="adminDrawerOpen = true"
    />

    <!-- Main area -->
    <div
      class="relative z-1 flex min-h-dvh min-w-0 flex-1 flex-col transition-[margin-left] duration-300 ease-out"
      :class="sidebarCollapsed ? 'md:ml-18' : 'md:ml-65'"
    >
      <AppHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
        @open-admin="adminDrawerOpen = true"
      />

      <main class="min-w-0 flex-1 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
        <div v-motion-fade-visible-once class="mx-auto w-full max-w-[1400px]">
          <slot />
        </div>
      </main>

      <AppFooter />
    </div>

    <!-- Global Admin Management Drawer (Live CRUD Console) -->
    <AdminManagementDrawer
      v-if="auth.isAdmin"
      :is-open="adminDrawerOpen"
      @close="adminDrawerOpen = false"
      @open-create-course="navigateToCourses"
      @data-changed="onDataChanged"
    />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AdminManagementDrawer from '~/components/admin/AdminManagementDrawer.vue'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()
const isHydrated = ref(false)
const sidebarCollapsed = ref(false)

onMounted(() => {
  isHydrated.value = true
})
const mobileSidebarOpen = ref(false)
const adminDrawerOpen = ref(false)

const router = useRouter()

function toggleSidebar() {
  if (import.meta.client && window.innerWidth < 768) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

function navigateToCourses() {
  adminDrawerOpen.value = false
  router.push('/courses')
}

function onDataChanged() {
  // Trigger router refresh or page reload
  if (import.meta.client) {
    window.dispatchEvent(new CustomEvent('academy:data-refresh'))
  }
}
</script>
<<<<<<< HEAD

<style scoped>
.auth-boot-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #0a0a0f;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.auth-boot-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(124, 58, 237, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: auth-boot-spin 0.8s linear infinite;
}

@keyframes auth-boot-spin {
  to { transform: rotate(360deg); }
}

.default-layout {
  display: flex;
  min-height: 100vh;
  background: #0a0a0f;
  position: relative;
  overflow-x: hidden;
}

.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  min-width: 0;
}

.main-wrapper.sidebar-collapsed {
  margin-left: 72px;
}

.main-wrapper.mobile-view {
  margin-left: 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-x: hidden;
}

.content-inner {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .main-content {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0 !important;
  }
  .main-content {
    padding: 1rem 0.85rem;
  }
}
</style>
=======
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
