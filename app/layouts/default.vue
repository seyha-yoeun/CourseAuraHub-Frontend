<template>
  <div v-if="!isHydrated || !auth.initialized" class="auth-boot-screen">
    <div class="auth-boot-spinner" />
    <p>Restoring your session...</p>
  </div>

  <div v-else class="default-layout">
    <!-- Background glowing orbs -->
    <div class="bg-orb" style="width:600px;height:600px;background:radial-gradient(circle,rgba(124,58,237,0.08),transparent 70%);top:-200px;left:-200px;"></div>
    <div class="bg-orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(37,99,235,0.06),transparent 70%);top:50%;right:-150px;"></div>
    <div class="bg-orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(5,150,105,0.05),transparent 70%);bottom:-100px;left:40%;"></div>

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
      class="main-wrapper"
      :class="{
        'sidebar-collapsed': sidebarCollapsed,
        'mobile-view': isMobile
      }"
    >
      <AppHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
        @open-admin="adminDrawerOpen = true"
      />

      <main class="main-content">
        <div v-motion-fade-visible-once class="content-inner">
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
const isMobile = ref(false)

const router = useRouter()

function checkMobile() {
  if (import.meta.client) {
    isMobile.value = window.innerWidth <= 768
    if (!isMobile.value) {
      mobileSidebarOpen.value = false
    }
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkMobile)
  }
})

function toggleSidebar() {
  if (isMobile.value) {
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
