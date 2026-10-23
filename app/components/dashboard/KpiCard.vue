<template>
  <div class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/8 hover:shadow-xl hover:shadow-violet-500/10 light:border-slate-200 light:bg-white light:hover:border-violet-300 light:hover:shadow-violet-500/10">
    <div class="flex size-12 shrink-0 items-center justify-center rounded-xl border" :class="accent.iconWrap">
      <component :is="icon" :size="22" :stroke-width="1.5" :class="accent.icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="mb-1 text-xs font-medium tracking-wide text-white/45 uppercase light:text-slate-500">{{ label }}</p>
      <div class="flex flex-wrap items-baseline gap-2">
        <span class="text-2xl leading-none font-bold tracking-tight text-slate-100 light:text-slate-900">{{ formattedValue }}</span>
        <span
          v-if="trend !== undefined"
          class="flex items-center gap-0.75 rounded-full px-1.75 py-0.5 text-[11px] font-semibold"
          :class="trend >= 0
            ? 'bg-emerald-400/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-700'
            : 'bg-red-400/12 text-red-400 light:bg-red-50 light:text-red-700'"
        >
          <TrendingUp v-if="trend >= 0" :size="13" />
          <TrendingDown v-else :size="13" />
          {{ Math.abs(trend) }}%
        </span>
      </div>
      <p class="mt-1 text-[11px] text-white/30 light:text-slate-400">{{ sub }}</p>
    </div>
    <div class="pointer-events-none absolute -right-5 -bottom-5 size-20 rounded-full opacity-50" :class="accent.glow" />
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import type { Component } from 'vue'

const props = defineProps<{
  label: string
  value: number | string
  sub?: string
  icon: Component
  accentColor: string
  trend?: number
  prefix?: string
  suffix?: string
  format?: 'number' | 'currency' | 'percent' | 'rating'
}>()

const accents: Record<string, { iconWrap: string; icon: string; glow: string }> = {
  '#8b5cf6': {
    iconWrap: 'border-violet-500/20 bg-violet-500/10 light:border-violet-300 light:bg-violet-50',
    icon: 'text-violet-400 light:text-violet-700',
    glow: 'bg-linear-to-br from-violet-500/15 to-transparent light:from-violet-500/10'
  },
  '#3b82f6': {
    iconWrap: 'border-blue-500/20 bg-blue-500/10 light:border-blue-300 light:bg-blue-50',
    icon: 'text-blue-400 light:text-blue-700',
    glow: 'bg-linear-to-br from-blue-500/15 to-transparent light:from-blue-500/10'
  },
  '#10b981': {
    iconWrap: 'border-emerald-500/20 bg-emerald-500/10 light:border-emerald-300 light:bg-emerald-50',
    icon: 'text-emerald-400 light:text-emerald-700',
    glow: 'bg-linear-to-br from-emerald-500/15 to-transparent light:from-emerald-500/10'
  },
  '#f59e0b': {
    iconWrap: 'border-amber-500/20 bg-amber-500/10 light:border-amber-300 light:bg-amber-50',
    icon: 'text-amber-400 light:text-amber-700',
    glow: 'bg-linear-to-br from-amber-500/15 to-transparent light:from-amber-500/10'
  }
}

const accent = computed(() => accents[props.accentColor] ?? accents['#8b5cf6']!)

const formattedValue = computed(() => {
  const v = Number(props.value)
  if (props.format === 'currency') {
    return `$${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(2)}`
  }
  if (props.format === 'percent') return `${v}%`
  if (props.format === 'rating') return `${v.toFixed(1)}★`
  if (props.format === 'number' && v >= 1000) return (v / 1000).toFixed(1) + 'K'
  return String(props.value)
})
</script>
