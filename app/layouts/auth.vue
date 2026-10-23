<template>
  <div class="relative h-dvh w-full overflow-hidden overscroll-none bg-[linear-gradient(135deg,#0a0a0f_0%,#0f101b_50%,#0a0a0f_100%)] light:bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_50%,#f8fafc_100%)]">
    <!-- Background orbs -->
    <div class="pointer-events-none fixed -left-[200px] -top-[200px] z-0 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_70%)] blur-[80px]" />
    <div class="pointer-events-none fixed -bottom-[150px] -right-[150px] z-0 size-[500px] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.06),transparent_70%)] blur-[80px]" />

    <!-- Even 50/50 split, locked to the viewport height -->
    <div class="relative z-[1] grid h-full min-h-0 grid-cols-1 lg:grid-cols-2">
      <!-- Left: hero / media panel (desktop only) -->
      <div class="hidden h-full min-h-0 overflow-hidden lg:block">
        <AuthHeroPanel />
      </div>

      <!-- Right: form panel — centers the form card both axes -->
      <div class="relative z-10 flex h-full min-h-0 items-center justify-center overflow-hidden p-6 sm:p-8 short:px-8 short:py-5">
        <!-- Capped height; scrolls internally only if the form cannot fit -->
        <div class="scrollbar-emerald max-h-[min(90dvh,100%)] w-full max-w-[436px] overflow-x-hidden overflow-y-auto p-2">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthHeroPanel from '~/components/auth/AuthHeroPanel.vue'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - CourseAuraHub Academy` : 'CourseAuraHub Academy - Course Sales Dashboard'
  },
  meta: [
    { name: 'description', content: 'Sign in to CourseAuraHub Academy - Master modern web development' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#059669' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }
  ]
})

// Auth pages are not scrollable: lock the document while this layout is mounted
onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>
