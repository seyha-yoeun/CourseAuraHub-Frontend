<template>
  <div class="relative min-h-dvh overflow-x-hidden bg-zinc-950 text-slate-200 print:min-h-0 print:overflow-visible print:bg-white light:bg-slate-50 light:text-slate-800">
    <div class="pointer-events-none fixed -top-50 -left-50 z-0 size-150 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.1),transparent_70%)] blur-[80px] print:hidden" />
    <div class="pointer-events-none fixed -right-40 bottom-0 z-0 size-125 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.07),transparent_70%)] blur-[80px] print:hidden" />

    <!-- Top bar -->
    <header class="sticky top-0 z-20 border-b border-white/8 bg-zinc-950/80 backdrop-blur-xl print:hidden light:border-slate-200 light:bg-white/85">
      <div class="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
        <NuxtLink :to="homeLink" class="group flex items-center gap-2.5 no-underline">
          <span class="flex size-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15 transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L26 9V19L14 26L2 19V9L14 2Z" fill="url(#infoLogoGrad)" />
              <defs>
                <linearGradient id="infoLogoGrad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#7c3aed" />
                  <stop offset="1" stop-color="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span class="text-sm font-bold tracking-tight text-slate-100 light:text-slate-900">CourseAuraHub</span>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <NuxtLink
            :to="homeLink"
            class="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.75 text-xs font-semibold text-white/70 no-underline transition-all duration-200 hover:border-violet-500/40 hover:bg-violet-500/12 hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 light:hover:border-violet-300 light:hover:bg-violet-50 light:hover:text-violet-700"
          >
            <ArrowLeft :size="14" class="transition-transform duration-200 group-hover:-translate-x-0.5" />
            {{ auth.isAuthenticated ? 'Back to app' : 'Back to sign in' }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <main v-motion-fade-visible-once class="relative z-1 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 print:max-w-none print:p-0 print:opacity-100!">
      <div class="mb-8 flex items-start gap-4 print:hidden">
        <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-linear-to-br from-violet-600/25 to-blue-600/15 shadow-[0_0_24px_rgba(124,58,237,0.2)]">
          <component :is="icon" :size="22" class="text-violet-300 light:text-violet-600" />
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
          class="group rounded-2xl border border-white/8 bg-white/3 p-5 transition-all duration-300 ease-out hover:border-violet-500/25 hover:bg-white/5 sm:p-6 light:border-slate-200 light:bg-white light:hover:border-violet-300 light:hover:shadow-[0_8px_24px_-12px_rgba(124,58,237,0.25)]"
        >
          <h2 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-100 light:text-slate-900">
            <span class="flex size-6 items-center justify-center rounded-md bg-violet-500/15 text-[11px] font-bold text-violet-300 transition-colors duration-300 group-hover:bg-violet-500/25 light:text-violet-700">{{ i + 1 }}</span>
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
