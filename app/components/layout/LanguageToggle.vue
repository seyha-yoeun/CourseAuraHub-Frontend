<template>
  <button
    type="button"
    class="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-white/8 bg-white/5 px-2.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 print:hidden light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
    :aria-label="locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'"
    :title="locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'"
    @click="setLocale(locale === 'km' ? 'en' : 'km')"
  >
    <Languages :size="15" />
    <span>{{ locale === 'km' ? 'EN' : 'ខ្មែរ' }}</span>
  </button>
</template>

<script setup lang="ts">
import { Languages } from 'lucide-vue-next'

const { locale, setLocale } = useT()
</script>
