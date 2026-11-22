<template>
  <div class="relative min-h-dvh overflow-x-hidden bg-zinc-950 text-slate-200 print:min-h-0 print:overflow-visible print:bg-white light:bg-slate-50 light:text-slate-800">
    <!-- Top bar -->
    <header class="sticky top-0 z-20 border-b border-white/8 bg-zinc-950/80 backdrop-blur-xl print:hidden light:border-slate-200 light:bg-white/85">
      <div class="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
        <NuxtLink :to="homeLink" class="group flex items-center gap-2.5 no-underline">
          <AuthLogo class="size-8 transition-transform duration-300 ease-out group-hover:-rotate-6" />
          <span class="text-sm font-bold tracking-tight text-slate-100 light:text-slate-900">CourseAuraHub</span>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <NuxtLink
            :to="homeLink"
            class="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.75 text-xs font-semibold text-white/70 no-underline transition-all duration-200 hover:border-brand-500/40 hover:bg-brand-500/12 hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 light:hover:border-brand-300 light:hover:bg-brand-50 light:hover:text-brand-700"
          >
            <ArrowLeft :size="14" class="transition-transform duration-200 group-hover:-translate-x-0.5" />
            {{ auth.isAuthenticated ? 'Back to app' : 'Back to sign in' }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <main v-motion-fade-visible-once class="relative z-1 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 print:max-w-none print:p-0 print:opacity-100!">
      <div class="mb-8 flex items-start gap-4 print:hidden">
        <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-600/25">
          <component :is="icon" :size="22" class="text-brand-300 light:text-brand-600" />
        </div>
        <div class="min-w-0">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-3xl light:text-slate-900">{{ title }}</h1>
          <p class="mt-1.5 text-sm text-white/55 light:text-slate-500">{{ subtitle }}</p>
        </div>
      </div>

      <slot name="before" />

      <div class="flex flex-col gap-3">
        <section
          v-for="(section, i) in sections"
          :key="section.heading"
          class="group rounded-2xl border border-white/8 bg-white/3 p-5 transition-all duration-300 ease-out hover:border-brand-500/25 hover:bg-white/5 sm:p-6 light:border-slate-200 light:bg-white light:hover:border-brand-300"
        >
          <h2 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-100 light:text-slate-900">
            <span class="flex size-6 items-center justify-center rounded-md bg-brand-500/15 text-[11px] font-bold text-brand-300 transition-colors duration-300 group-hover:bg-brand-500/25 light:text-brand-700">{{ i + 1 }}</span>
            {{ section.heading }}
          </h2>
          <p class="mt-2.5 text-[13.5px] leading-relaxed text-white/60 light:text-slate-600">{{ section.body }}</p>
        </section>
      </div>

      <p v-if="updated" class="mt-8 text-center text-xs text-white/35 light:text-slate-400">Last updated {{ updated }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { Component } from 'vue'
import LanguageToggle from '~/components/layout/LanguageToggle.vue'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import AuthLogo from '~/components/auth/AuthLogo.vue'
import { useAuth } from '~/composables/useAuth'

defineProps<{
  title: string
  subtitle: string
  icon: Component
  sections: { heading: string, body: string }[]
  updated?: string
}>()

const auth = useAuth()
const homeLink = computed(() => auth.isAuthenticated ? auth.homeRoute : '/auth/login')
</script>
