<template>
  <UApp :toaster="{ position: 'bottom-right' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ExperimentNoticeModal />
  </UApp>
</template>

<script setup lang="ts">
import ExperimentNoticeModal from '~/components/shared/ExperimentNoticeModal.vue'

const { locale } = useT()

useHead({
  htmlAttrs: { lang: locale },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - CourseAuraHub Academy` : 'CourseAuraHub Academy - Course Sales Dashboard'
  },
  meta: [
    { name: 'description', content: 'Production-ready CourseAuraHub Academy course sales dashboard built with Nuxt 3, Nuxt UI, and Vue 3' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#0a0a0f' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;500;600;700&family=Noto+Serif+Khmer:wght@400;700&display=swap' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }
  ]
})
</script>
