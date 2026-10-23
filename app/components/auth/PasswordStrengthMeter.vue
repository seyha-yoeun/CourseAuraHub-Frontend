<template>
  <div v-if="show && password" class="mt-2">
    <div class="h-1 overflow-hidden rounded-xs bg-white/8 light:bg-slate-200">
      <div
        class="h-full rounded-xs transition-all duration-300"
        :class="barClass"
      />
    </div>
    <div class="mt-1.5 flex justify-between text-[11px] text-white/40 light:text-slate-400">
      <span class="flex items-center gap-1 transition-colors duration-200" :class="checks[0] && 'font-semibold text-emerald-500'">{{ checks[0] ? '✓' : '○' }} 8+ chars</span>
      <span class="flex items-center gap-1 transition-colors duration-200" :class="checks[1] && 'font-semibold text-emerald-500'">{{ checks[1] ? '✓' : '○' }} Uppercase</span>
      <span class="flex items-center gap-1 transition-colors duration-200" :class="checks[2] && 'font-semibold text-emerald-500'">{{ checks[2] ? '✓' : '○' }} Number</span>
      <span class="flex items-center gap-1 transition-colors duration-200" :class="checks[3] && 'font-semibold text-emerald-500'">{{ checks[3] ? '✓' : '○' }} Symbol</span>
    </div>
    <p class="mt-1.5 text-xs font-medium transition-colors duration-200" :class="textClass">{{ strengthLabel }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  password: string
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: true
})

const checks = computed(() => {
  const pwd = props.password
  return [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd)
  ]
})

const passedChecks = computed(() => checks.value.filter(Boolean).length)

// 0-1 checks => level 0 (25% / red), 2 => fair, 3 => strong, 4 => very strong
const strengthLevel = computed(() => {
  if (passedChecks.value <= 1) return 0
  if (passedChecks.value === 2) return 1
  if (passedChecks.value === 3) return 2
  return 3
})

const barClass = computed(() => [
  'w-1/4 bg-red-500',
  'w-1/2 bg-amber-400',
  'w-3/4 bg-emerald-400',
  'w-full bg-emerald-500'
][strengthLevel.value])

const textClass = computed(() => [
  'text-red-500',
  'text-amber-400',
  'text-emerald-400',
  'text-emerald-500'
][strengthLevel.value])

const strengthLabel = computed(() => {
  if (!props.password) return ''
  if (passedChecks.value <= 1) return 'Weak password'
  if (passedChecks.value === 2) return 'Fair password'
  if (passedChecks.value === 3) return 'Strong password'
  return 'Very strong password'
})
</script>
