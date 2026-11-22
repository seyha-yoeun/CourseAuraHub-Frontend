<template>
  <div class="flex flex-col rounded-[14px] border border-white/10 bg-white/[0.03] p-4.5 light:border-slate-200 light:bg-white">
    <div class="flex items-center justify-between gap-3">
      <p class="truncate text-[13px] font-medium text-white/55 light:text-slate-500">{{ label }}</p>
      <component :is="icon" :size="16" :stroke-width="1.75" class="shrink-0 text-white/35 light:text-slate-400" aria-hidden="true" />
    </div>
    <div class="mt-2 flex flex-wrap items-baseline gap-2">
      <span class="text-[26px] leading-tight font-bold tracking-[-0.02em] text-slate-50 tabular-nums light:text-slate-900">{{ formattedValue }}</span>
      <span
        v-if="trend !== undefined"
        class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums"
        :class="trend >= 0
          ? 'bg-brand-500/15 text-brand-300 light:bg-brand-50 light:text-brand-600'
          : 'bg-rose-500/15 text-rose-300 light:bg-negative-bg light:text-negative'"
      >
        <ArrowUp v-if="trend >= 0" :size="11" :stroke-width="2.5" aria-hidden="true" />
        <ArrowDown v-else :size="11" :stroke-width="2.5" aria-hidden="true" />
        <span class="sr-only">{{ trend >= 0 ? 'Up' : 'Down' }}</span>
        {{ Math.abs(trend) }}%
      </span>
    </div>
    <p v-if="sub" class="mt-1 text-[12px] text-white/40 light:text-slate-500">{{ sub }}</p>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from 'lucide-vue-next'
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

// accentColor is still accepted for backwards compatibility; the clean card style
// (assets/css/main.css colour system) uses one neutral icon treatment for every card.

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
