<template>
  <div class="kpi-card glass glass-hover card-lift" :style="{ '--accent': accentColor }">
    <div class="kpi-icon-wrap" :style="{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }">
      <component :is="icon" :size="22" :stroke-width="1.5" :style="{ color: accentColor }" />
    </div>
    <div class="kpi-body">
      <p class="kpi-label">{{ label }}</p>
      <div class="kpi-value-row">
        <span class="kpi-value">{{ formattedValue }}</span>
        <span v-if="trend !== undefined" class="kpi-trend" :class="trend >= 0 ? 'trend-up' : 'trend-down'">
          <TrendingUp v-if="trend >= 0" :size="13" />
          <TrendingDown v-else :size="13" />
          {{ Math.abs(trend) }}%
        </span>
      </div>
      <p class="kpi-sub">{{ sub }}</p>
    </div>
    <div class="kpi-sparkline" :style="{ background: `linear-gradient(135deg, ${accentColor}15, transparent)` }"></div>
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

<style scoped>
.kpi-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  overflow: hidden;
  cursor: default;
}

.kpi-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-body {
  flex: 1;
  min-width: 0;
}

.kpi-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.5px;
  line-height: 1;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
}

.trend-up {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
}

.trend-down {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
}

.kpi-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

.kpi-sparkline {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0.5;
  transform: translate(20px, 20px);
}
</style>
