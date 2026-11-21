<template>
  <div class="min-h-dvh bg-[#0a0a0f] text-slate-100 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] light:bg-white light:text-slate-900">
    <!-- Form column -->
    <div class="relative flex min-h-dvh flex-col px-4 py-4 sm:px-10 sm:py-7 lg:px-12 xl:px-16 sm:short:py-5">
      <header class="flex items-center justify-between gap-3">
        <NuxtLink
          to="/courses"
          class="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
          aria-label="CourseAuraHub - browse courses"
        >
          <AuthLogo class="size-8 transition-transform duration-200 group-hover:-rotate-6" />
          <span class="text-[15px] font-bold tracking-[-0.01em] text-slate-50 light:text-slate-900">CourseAuraHub</span>
        </NuxtLink>
        <ThemeToggle />
      </header>

      <main id="main" class="flex flex-1 items-center justify-center py-8 sm:py-10 short:py-5">
        <div v-motion="frameEnter" class="w-full max-w-[400px]">
          <AuthTabs v-if="activeTab" :active="activeTab" class="mb-7 short:mb-5" />

          <!-- Height-animated frame: pages (and register's steps) cross-slide inside it,
               the outgoing one absolutely positioned, while the height eases to the new content. -->
          <div
            class="-m-2 overflow-hidden p-2 transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            :style="frameHeight ? { height: `${frameHeight}px` } : undefined"
          >
            <div ref="frameContent" class="relative">
              <slot />
            </div>
          </div>
        </div>
      </main>

      <footer class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[12.5px] text-white/40 light:text-slate-500">
        <span class="inline-flex items-center gap-1.5">
          <Lock :size="13" aria-hidden="true" />
          Secure, encrypted sign-in
        </span>
        <nav aria-label="Legal and help" class="flex items-center gap-1">
          <NuxtLink to="/terms" :class="footerLink">Terms</NuxtLink>
          <span aria-hidden="true">·</span>
          <NuxtLink to="/privacy" :class="footerLink">Privacy</NuxtLink>
          <span aria-hidden="true">·</span>
          <NuxtLink to="/support" :class="footerLink">Help</NuxtLink>
        </nav>
      </footer>
    </div>

    <!-- Showcase panel (desktop only), pinned while the form column scrolls -->
    <aside class="sticky top-0 hidden h-dvh p-3 lg:block" aria-label="About CourseAuraHub">
      <AuthHeroPanel />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Lock } from 'lucide-vue-next'
import AuthHeroPanel from '~/components/auth/AuthHeroPanel.vue'
import AuthLogo from '~/components/auth/AuthLogo.vue'
import AuthTabs from '~/components/auth/AuthTabs.vue'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'

const route = useRoute()

const activeTab = computed(() => {
  const path = route.path.replace(/\/+$/, '')
  if (path === '/auth/login') return 'login'
  if (path === '/auth/register') return 'register'
  return null
})

// Fades the form in on first load only; the layout stays mounted across auth pages,
// where the page transitions (auth-transition.global.ts) take over.
const frameEnter = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
}

// Track the content height so the frame can interpolate between pages/steps.
// The frame's 8px padding on each side (p-2) is added back on.
const frameContent = ref<HTMLElement | null>(null)
const frameHeight = ref<number | null>(null)
let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  if (!frameContent.value || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => {
    if (frameContent.value) frameHeight.value = frameContent.value.offsetHeight + 16
  })
  resizeObserver.observe(frameContent.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

const footerLink = 'rounded-sm px-1 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 light:hover:text-slate-800'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - CourseAuraHub Academy` : 'CourseAuraHub Academy'
  },
  meta: [
    { name: 'description', content: 'Sign in to CourseAuraHub Academy - Master modern web development' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#0f2f24' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap' }
  ]
})
</script>
