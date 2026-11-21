<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-slate-200 light:text-slate-900">{{ title }}</h3>
        <p class="mt-0.5 text-xs text-white/35 light:text-slate-500">{{ subtitle }}</p>
      </div>
      <div class="flex gap-1 rounded-lg border border-white/7 bg-white/4 p-0.75 light:border-slate-200 light:bg-slate-100">
        <button
          v-for="tab in ['Revenue', 'Enrollments']"
          :key="tab"
          class="cursor-pointer rounded-md border border-transparent px-3.5 py-1.25 text-xs font-medium text-white/45 transition-all hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-slate-500 light:hover:text-slate-700"
          :class="{ 'border-brand-500/30 bg-brand-500/25 text-brand-300 light:border-brand-200 light:bg-brand-100 light:text-brand-700': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>
    <div class="relative h-65">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="h-62.5 animate-pulse rounded-lg bg-white/5 light:bg-slate-100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartOptions } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  title: string
  subtitle?: string
  months: string[]
  monthlyRevenue: number[]
  monthlyEnrollments: number[]
}>()

const activeTab = ref('Revenue')
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// brand-500 on light, brand-400 on dark (assets/css/main.css colour system)
const lineColor = computed(() => (isDark.value ? '#4dbb8f' : '#0e7c5a'))

const chartData = computed(() => {
  if (!props.months?.length) return null
  const isRevenue = activeTab.value === 'Revenue'
  return {
    labels: props.months,
    datasets: [
      {
        label: isRevenue ? 'Revenue ($)' : 'Enrollments',
        data: isRevenue ? props.monthlyRevenue : props.monthlyEnrollments,
        // One series at a time, so both use the brand colour (lighter brand-400 on dark).
        borderColor: lineColor.value,
        backgroundColor: isDark.value ? 'rgba(77, 187, 143, 0.12)' : 'rgba(14,124,90, 0.10)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: lineColor.value,
        pointBorderColor: isDark.value ? '#0a100d' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => {
  // ink-400 axis labels, line-coloured grid
  const gridColor = isDark.value ? 'rgba(255,255,255,0.05)' : '#eef1ef'
  const tickColor = isDark.value ? 'rgba(255,255,255,0.4)' : '#97a39d'
  const borderColor = isDark.value ? 'rgba(255,255,255,0.08)' : '#e5eae7'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        // forest-900 tooltip in both themes
        backgroundColor: '#0d2a21',
        borderColor: 'rgba(159,227,198, 0.2)',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#9fe3c6',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y ?? 0
            return activeTab.value === 'Revenue' ? `  $${v.toLocaleString()}` : `  ${v.toLocaleString()} students`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { size: 11 } },
        border: { color: borderColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          callback: (value) => { const v = Number(value); return activeTab.value === 'Revenue' ? `$${(v / 1000).toFixed(0)}K` : v },
        },
        border: { color: borderColor },
      },
    },
  }
})
</script>
