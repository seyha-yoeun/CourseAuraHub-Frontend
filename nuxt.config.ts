// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@vueuse/motion/nuxt',
    '@pinia/nuxt',
  ],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_API_BASE || 'http://localhost:8080/api/v1',
      siteUrl: process.env.NUXT_SITE_URL || 'http://localhost:3000'
    }
  },
  nitro: {
    routeRules: {
      '/auth/**': { cors: true },
      '/api/auth/**': { cors: true }
    }
  }
})
