<template>
  <footer class="flex flex-col items-center justify-between gap-2 border-t border-white/5 bg-zinc-950/60 px-4 py-3.5 transition-colors sm:flex-row sm:px-6 light:border-slate-200 light:bg-white">
    <span class="text-xs text-white/35 light:text-slate-500">© {{ year }} CourseAuraHub Academy. {{ t('All rights reserved.') }}</span>
    <nav aria-label="Footer" class="flex gap-4">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group relative text-xs text-white/35 no-underline transition-colors duration-200 hover:text-brand-300 focus-visible:outline-none focus-visible:text-brand-300 light:text-slate-500 light:hover:text-brand-700"
      >
        {{ t(link.label) }}
        <span aria-hidden="true" class="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
      </NuxtLink>
    </nav>
  </footer>
</template>

<script setup lang="ts">
const { t } = useT()

// The default layout renders client-side only, so this is always the visitor's current year.
const year = new Date().getFullYear()

const links = [
  { to: '/support', label: 'Help' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' }
]
</script>
