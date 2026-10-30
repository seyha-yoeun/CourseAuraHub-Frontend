<template>
  <span class="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.75 text-[11px] font-semibold tracking-wide" :class="badgeClass">
    <span class="size-1.5 rounded-full bg-current" />
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types'

const props = defineProps<{ status: OrderStatus }>()

const label = computed(() => props.status.charAt(0) + props.status.slice(1).toLowerCase())

const badgeClass = computed(() => {
  if (props.status === 'PAID') return 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  if (props.status === 'PENDING') return 'border-amber-400/30 bg-amber-400/12 text-amber-400 light:border-amber-300 light:bg-amber-50 light:text-amber-700'
  if (props.status === 'FAILED') return 'border-rose-400/30 bg-rose-400/12 text-rose-400 light:border-rose-200 light:bg-rose-50 light:text-rose-600'
  if (props.status === 'REFUNDED') return 'border-blue-400/30 bg-blue-400/12 text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-700'
  return 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'
})
</script>
