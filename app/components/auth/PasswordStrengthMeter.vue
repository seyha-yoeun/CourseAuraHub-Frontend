<template>
  <div v-if="show" class="mt-1">
    <div class="flex items-center gap-3">
      <div class="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
        <span
          v-for="segment in 4"
          :key="segment"
          class="h-1 rounded-full transition-colors duration-300"
          :class="password && segment <= strengthLevel + 1 ? barColor : 'bg-white/10 light:bg-slate-200'"
        />
      </div>
      <span v-if="password" class="text-[12px] font-semibold transition-colors duration-200" :class="textColor" aria-live="polite">
        {{ strengthLabel }}
      </span>
    </div>
    <ul class="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px]" aria-label="Password requirements">
      <li
        v-for="rule in rules"
        :key="rule.label"
        class="flex items-center gap-1.5 transition-colors duration-200"
        :class="rule.met
          ? 'text-emerald-400 light:text-emerald-700'
          : flagUnmet ? 'font-medium text-rose-400 light:text-rose-600' : 'text-white/45 light:text-slate-500'"
      >
        <CircleCheck v-if="rule.met" :size="13" class="shrink-0" aria-hidden="true" />
        <CircleX v-else-if="flagUnmet" :size="13" class="shrink-0" aria-hidden="true" />
        <Circle v-else :size="13" class="shrink-0" aria-hidden="true" />
        <span>{{ rule.label }}<span class="sr-only">{{ rule.met ? ' (met)' : ' (not met yet)' }}</span></span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Circle, CircleCheck, CircleX } from 'lucide-vue-next'

interface Props {
  password: string
  show?: boolean
  /** Highlight unmet rules in red, e.g. after a submit attempt. */
  flagUnmet?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  flagUnmet: false
})

// Mirrors the backend rule: 8+ chars with upper, lower, number and symbol.
const rules = computed(() => {
  const pwd = props.password
  return [
    { label: '8+ characters', met: pwd.length >= 8 },
    { label: 'Upper & lowercase', met: /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) },
    { label: 'A number', met: /[0-9]/.test(pwd) },
    { label: 'A symbol', met: /[^A-Za-z0-9]/.test(pwd) },
  ]
})

const passedChecks = computed(() => rules.value.filter(rule => rule.met).length)

// 0-1 checks => weak, 2 => fair, 3 => good, 4 => strong
const strengthLevel = computed(() => Math.max(0, passedChecks.value - 1))

const barColor = computed(() => [
  'bg-rose-500',
  'bg-amber-400',
  'bg-emerald-400 light:bg-emerald-500',
  'bg-emerald-500 light:bg-emerald-600'
][strengthLevel.value])

const textColor = computed(() => [
  'text-rose-400 light:text-rose-600',
  'text-amber-400 light:text-amber-600',
  'text-emerald-400 light:text-emerald-600',
  'text-emerald-400 light:text-emerald-700'
][strengthLevel.value])

const strengthLabel = computed(() => ['Weak', 'Fair', 'Good', 'Strong'][strengthLevel.value])
</script>
