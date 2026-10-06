<template>
  <div class="stat-card glass glass-hover card-lift" :style="{ '--accent': accentColor }">
    <div class="stat-header">
      <span class="stat-label">{{ label }}</span>
      <div class="stat-icon-wrap" :style="{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }">
        <component :is="icon" :size="18" :stroke-width="1.8" :style="{ color: accentColor }" />
      </div>
    </div>
    
    <div class="stat-body">
      <div class="stat-value-row">
        <span class="stat-value">{{ formattedValue }}</span>
        <span v-if="trend !== undefined" class="stat-trend" :class="trend >= 0 ? 'trend-up' : 'trend-down'">
          <TrendingUp v-if="trend >= 0" :size="12" />
          <TrendingDown v-else :size="12" />
          {{ Math.abs(trend) }}%
        </span>
      </div>
      <p v-if="sub" class="stat-sub">{{ sub }}</p>
    </div>

    <!-- Soft glow backdrop -->
    <div class="stat-glow" :style="{ background: `radial-gradient(circle, ${accentColor}20, transparent 70%)` }"></div>
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

<style scoped>
.stat-card {
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.3px;
}

.stat-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-body {
  position: relative;
  z-index: 1;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.8px;
  line-height: 1.1;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
}

.trend-up {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.25);
}

.trend-down {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.25);
}

.stat-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 6px;
}

.stat-glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  pointer-events: none;
}
</style>
