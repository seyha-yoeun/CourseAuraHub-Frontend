<template>
  <div v-if="show && password" class="password-strength-meter">
    <div class="strength-meter" :class="strengthClass">
      <div 
        class="strength-bar" 
        :style="{ width: `${strengthPercent}%`, backgroundColor: strengthColor }"
      />
    </div>
    <div class="strength-labels">
      <span :class="{ active: checks[0] }">{{ checks[0] ? '✓' : '○' }} 8+ chars</span>
      <span :class="{ active: checks[1] }">{{ checks[1] ? '✓' : '○' }} Uppercase</span>
      <span :class="{ active: checks[2] }">{{ checks[2] ? '✓' : '○' }} Number</span>
      <span :class="{ active: checks[3] }">{{ checks[3] ? '✓' : '○' }} Symbol</span>
    </div>
    <p class="strength-text" :style="{ color: strengthColor }">{{ strengthLabel }}</p>
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
  if (!pwd) return []
  return [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd)
  ]
})

const passedChecks = computed(() => checks.value.filter(Boolean).length)

const strengthPercent = computed(() => {
  if (!props.password) return 0
  return Math.max(25, (passedChecks.value / 4) * 100)
})

const strengthColor = computed(() => {
  if (passedChecks.value <= 1) return '#ef4444'
  if (passedChecks.value === 2) return '#fbbf24'
  if (passedChecks.value === 3) return '#34d399'
  return '#10b981'
})

const strengthLabel = computed(() => {
  if (!props.password) return ''
  if (passedChecks.value <= 1) return 'Weak password'
  if (passedChecks.value === 2) return 'Fair password'
  if (passedChecks.value === 3) return 'Strong password'
  return 'Very strong password'
})

const strengthClass = computed(() => {
  if (passedChecks.value <= 1) return 'strength-weak'
  if (passedChecks.value === 2) return 'strength-fair'
  if (passedChecks.value === 3) return 'strength-strong'
  return 'strength-very-strong'
})
</script>

<style scoped>
.password-strength-meter {
  margin-top: 8px;
}

.strength-meter {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

html.light .strength-meter {
  background: #e2e8f0;
}

.strength-bar {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.strength-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

html.light .strength-labels {
  color: #94a3b8;
}

.strength-labels span {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;
}

.strength-labels span.active {
  color: var(--emerald-500);
  font-weight: 600;
}

.strength-text {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: color 0.2s ease;
}
</style>