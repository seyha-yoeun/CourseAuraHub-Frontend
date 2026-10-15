<template>
  <div class="auth-layout">
    <!-- Background orbs -->
    <div class="bg-orb" style="width:600px;height:600px;background:radial-gradient(circle,rgba(16,185,129,0.08),transparent 70%);top:-200px;left:-200px;"></div>
    <div class="bg-orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(5,150,105,0.06),transparent 70%);bottom:-150px;right:-150px;"></div>

    <div class="auth-split">
      <!-- Left: Hero / media panel (desktop only) -->
      <div class="auth-hero-side">
        <AuthHeroPanel />
      </div>

      <!-- Right: Form panel (scrolls internally on short screens) -->
      <div class="auth-form-side">
        <div class="auth-form-inner">
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

<style scoped>
/* Locked to the viewport — the page itself never scrolls */
.auth-layout {
  height: 100vh;
  height: 100dvh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0f 0%, #0f101b 50%, #0a0a0f 100%);
}

/* Background orbs */
.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

/* Split layout — even 50/50 columns, fixed to the viewport height */
.auth-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  min-height: 0;
  position: relative;
  z-index: 1;
}

/* Hero / media side — desktop only */
.auth-hero-side {
  display: none;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

@media (min-width: 1025px) {
  .auth-hero-side {
    display: block;
  }
}

/* Form side — its own scroll container when the form is taller than the viewport */
.auth-form-side {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 2.5rem 2rem;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 10;
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 185, 129, 0.35) transparent;
}

.auth-form-side::-webkit-scrollbar {
  width: 6px;
}

.auth-form-side::-webkit-scrollbar-track {
  background: transparent;
}

.auth-form-side::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.35);
  border-radius: 99px;
}

/* Keeps the card centered; margin:auto lets the column scroll (top stays reachable) when content is taller */
.auth-form-inner {
  width: 100%;
  max-width: 420px;
  margin: auto;
}

@media (max-width: 1024px) {
  .auth-split {
    grid-template-columns: 1fr;
  }

  .auth-form-side {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .auth-form-side {
    padding: 1.5rem 1rem;
  }
}

/* Shorter viewports: tighter column padding helps forms fit without scrolling */
@media (max-height: 800px) {
  .auth-form-side {
    padding: 1.25rem 2rem;
  }
}

html.light .auth-layout {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%);
}
</style>
