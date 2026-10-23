<template>
  <div class="relative flex min-h-dvh overflow-x-hidden bg-zinc-950 light:bg-slate-50">
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

const sidebarCollapsed = ref(false)
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
