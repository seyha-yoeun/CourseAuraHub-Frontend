// https://nuxt.com/docs/api/configuration/nuxt-config

// File-change events from Windows drives mounted in WSL (/mnt/*) don't reach the dev server,
// so edits are silently ignored until restart. Poll there instead (or force it with NUXT_WATCH_POLLING=true).
const watchPolling = process.env.NUXT_WATCH_POLLING
  ? process.env.NUXT_WATCH_POLLING === 'true'
  : process.platform === 'linux' && process.cwd().startsWith('/mnt/')

export default defineNuxtConfig({
  watchers: {
    chokidar: { usePolling: watchPolling, interval: 300 },
  },
  vite: {
    server: {
      watch: { usePolling: watchPolling, interval: 300 },
    },
  },
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
    // Light-first colour system (assets/css/main.css); dark stays one toggle away.
    preference: 'light',
    fallback: 'light',
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
    },
    hooks: {
      // Nitro types every server/api route for $fetch. With this many routes, matching a call against them
      // is too deep for vue-tsc (TS2589), which fails CI. App code always names the response type
      // ($fetch<T>(...)), so the generated route table isn't needed.
      'types:extend'(types) {
        types.routes = {}
      }
    }
  }
})
