<template>
  <div
    v-if="!isHydrated || !auth.initialized"
    class="flex min-h-dvh flex-col items-center justify-center gap-3.5 bg-zinc-950 text-[13px] text-white/60 light:bg-slate-50 light:text-slate-500"
  >
    <div class="size-8 animate-spin rounded-full border-[3px] border-brand-500/20 border-t-brand-500" />
    <p>Restoring your session...</p>
  </div>

  <div v-else class="relative flex min-h-dvh overflow-x-hidden bg-zinc-950 light:bg-slate-50">
    <!-- Sidebar with desktop collapse + mobile drawer -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @toggle="toggleSidebar"
      @close-mobile="mobileSidebarOpen = false"
    />

    <!-- Main area -->
    <div
      class="relative z-1 flex min-h-dvh min-w-0 flex-1 flex-col transition-[margin-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      :class="sidebarCollapsed ? 'md:ml-18' : 'md:ml-65'"
    >
      <AppHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />

      <main class="min-w-0 flex-1 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
        <div v-motion-fade-visible-once class="mx-auto w-full max-w-[1400px]">
          <slot />
        </div>
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()
const isHydrated = ref(false)
const sidebarCollapsed = ref(false)

onMounted(() => {
  isHydrated.value = true
})
const mobileSidebarOpen = ref(false)

function toggleSidebar() {
  if (import.meta.client && window.innerWidth < 768) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}
</script>
