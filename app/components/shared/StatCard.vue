<template>
  <div class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/8 hover:shadow-xl hover:shadow-violet-500/10 light:border-slate-200 light:bg-white light:hover:border-violet-300 light:hover:shadow-violet-500/10">
    <div class="mb-3.5 flex items-center justify-between">
      <span class="text-[13px] font-medium tracking-wide text-white/50 light:text-slate-500">{{ label }}</span>
      <div class="flex size-9 shrink-0 items-center justify-center rounded-xl border" :class="accent.iconWrap">
        <component :is="icon" :size="18" :stroke-width="1.8" :class="accent.icon" />
      </div>
    </div>

    <div class="relative z-1">
      <div class="flex flex-wrap items-baseline gap-2.5">
        <span class="text-3xl leading-tight font-extrabold tracking-tight text-slate-50 light:text-slate-900">{{ formattedValue }}</span>
        <span
          v-if="trend !== undefined"
          class="inline-flex items-center gap-0.75 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
          :class="trend >= 0
            ? 'border-emerald-400/25 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
            : 'border-red-400/25 bg-red-400/12 text-red-400 light:border-red-300 light:bg-red-50 light:text-red-700'"
        >
          <TrendingUp v-if="trend >= 0" :size="12" />
          <TrendingDown v-else :size="12" />
          {{ Math.abs(trend) }}%
        </span>
      </div>
      <p v-if="sub" class="mt-1.5 text-[11px] text-white/35 light:text-slate-400">{{ sub }}</p>
    </div>

    <!-- Soft glow backdrop -->
    <div class="pointer-events-none absolute -top-5 -right-5 size-25 rounded-full opacity-60 blur-2xl" :class="accent.glow" />
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number | string
    sub?: string
    icon: Component
    accentColor?: string
    trend?: number
    format?: 'number' | 'currency' | 'percent' | 'rating'
  }>(),
  {
    accentColor: '#7c3aed',
    sub: undefined,
    trend: undefined,
    format: 'number'
  }
)

const accents: Record<string, { iconWrap: string; icon: string; glow: string }> = {
  '#7c3aed': {
    iconWrap: 'border-violet-500/20 bg-violet-500/10 light:border-violet-300 light:bg-violet-50',
    icon: 'text-violet-400 light:text-violet-700',
    glow: 'bg-violet-500/20 light:bg-violet-500/10'
  },
  '#8b5cf6': {
    iconWrap: 'border-violet-500/20 bg-violet-500/10 light:border-violet-300 light:bg-violet-50',
    icon: 'text-violet-400 light:text-violet-700',
    glow: 'bg-violet-500/20 light:bg-violet-500/10'
  },
  '#3b82f6': {
    iconWrap: 'border-blue-500/20 bg-blue-500/10 light:border-blue-300 light:bg-blue-50',
    icon: 'text-blue-400 light:text-blue-700',
    glow: 'bg-blue-500/20 light:bg-blue-500/10'
  },
  '#10b981': {
    iconWrap: 'border-emerald-500/20 bg-emerald-500/10 light:border-emerald-300 light:bg-emerald-50',
    icon: 'text-emerald-400 light:text-emerald-700',
    glow: 'bg-emerald-500/20 light:bg-emerald-500/10'
  },
  '#f59e0b': {
    iconWrap: 'border-amber-500/20 bg-amber-500/10 light:border-amber-300 light:bg-amber-50',
    icon: 'text-amber-400 light:text-amber-700',
    glow: 'bg-amber-500/20 light:bg-amber-500/10'
  }
}

const accent = computed(() => accents[props.accentColor] ?? accents['#7c3aed']!)

const formattedValue = computed(() => {
  const v = Number(props.value)
  if (isNaN(v)) return String(props.value)
  if (props.format === 'currency') {
    return `$${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(2)}`
  }
  if (props.format === 'percent') return `${v}%`
  if (props.format === 'rating') return `${v.toFixed(1)} ★`
  if (props.format === 'number' && v >= 1000) return (v / 1000).toFixed(1) + 'K'
  return String(props.value)
})
</script>
