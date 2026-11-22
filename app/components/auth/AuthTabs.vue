<template>
  <!-- Rendered by layouts/auth.vue so it survives the login <-> register navigation
       and the active pill can slide instead of jumping. -->
  <nav :aria-label="t('Account access')" class="relative grid w-[208px] grid-cols-2 rounded-[10px] border border-white/10 bg-white/[0.04] p-1 light:border-slate-200 light:bg-slate-100/80">
    <span
      aria-hidden="true"
      class="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-[7px] bg-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none light:bg-white light:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]"
      :class="active === 'register' ? 'translate-x-full' : 'translate-x-0'"
    />
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.id"
      :to="tab.to"
      :aria-current="active === tab.id ? 'page' : undefined"
      class="relative z-1 rounded-[7px] py-1.5 text-center text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
      :class="active === tab.id
        ? 'text-slate-50 light:text-slate-900'
        : 'text-white/55 hover:text-slate-100 light:text-slate-500 light:hover:text-slate-800'"
    >
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getSafeRedirect } from '~/utils/authRedirect'

const { t } = useT()

defineProps<{
  active: 'login' | 'register'
}>()

const route = useRoute()

// Carry ?redirect= across so switching tabs doesn't lose where the user was headed.
const tabs = computed(() => {
  const redirect = getSafeRedirect(route.query.redirect)
  const query = redirect ? { redirect } : undefined
  return [
    { id: 'login', label: t('Log in'), to: { path: '/auth/login', query } },
    { id: 'register', label: t('Sign up'), to: { path: '/auth/register', query } },
  ] as const
})
</script>
