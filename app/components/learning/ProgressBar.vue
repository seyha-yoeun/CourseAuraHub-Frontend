<template>
  <div class="flex items-center gap-2.5">
    <div
      class="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8 light:bg-slate-200"
      role="progressbar"
      :aria-valuenow="clamped"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label"
    >
      <div
        class="h-full rounded-full transition-[width] duration-500 ease-out"
        :class="clamped >= 100 ? 'bg-emerald-400' : 'bg-linear-to-r from-violet-500 to-blue-500'"
        :style="{ width: `${clamped}%` }"
      />
    </div>
    <span v-if="showValue" class="w-9 shrink-0 text-right text-[11px] font-semibold text-white/60 light:text-slate-600">{{ clamped }}%</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    showValue?: boolean
    label?: string
  }>(),
  {
    showValue: true,
    label: 'Course progress'
  }
)

const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value || 0))))
</script>
