<<<<<<< HEAD
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
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:8080/api/v1',
    cookieSecure: process.env.NUXT_COOKIE_SECURE
      ? process.env.NUXT_COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production',
    cookieSameSite: process.env.NUXT_COOKIE_SAME_SITE || 'lax',
    cookieDomain: process.env.NUXT_COOKIE_DOMAIN || '',
    public: {
      siteUrl: process.env.NUXT_SITE_URL || 'http://localhost:3000',
      backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
    }
  },
  nitro: {
    routeRules: {
      '/auth/**': { cors: true },
      '/api/auth/**': { cors: true }
    }
  }
})
=======
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
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
