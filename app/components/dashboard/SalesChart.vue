<template>
  <div class="chart-wrap glass">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">{{ title }}</h3>
        <p class="chart-sub">{{ subtitle }}</p>
      </div>
      <div class="chart-tabs">
        <button
          v-for="tab in ['Revenue', 'Enrollments']"
          :key="tab"
          class="chart-tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>
    <div class="chart-body">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="chart-loading shimmer" style="height:250px;border-radius:8px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const chartData = computed(() => {
  if (!props.months?.length) return null
  const isRevenue = activeTab.value === 'Revenue'
  return {
    labels: props.months,
    datasets: [
      {
        label: isRevenue ? 'Revenue ($)' : 'Enrollments',
        data: isRevenue ? props.monthlyRevenue : props.monthlyEnrollments,
        borderColor: isRevenue ? '#7c3aed' : '#2563eb',
        backgroundColor: isRevenue
          ? 'rgba(124, 58, 237, 0.12)'
          : 'rgba(37, 99, 235, 0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: isRevenue ? '#7c3aed' : '#2563eb',
        pointBorderColor: '#0a0a0f',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 15, 30, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: 'rgba(255,255,255,0.65)',
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx: { parsed: { y: number } }) => {
          const v = ctx.parsed.y
          return activeTab.value === 'Revenue' ? `  $${v.toLocaleString()}` : `  ${v.toLocaleString()} students`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } },
      border: { color: 'rgba(255,255,255,0.06)' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: {
        color: 'rgba(255,255,255,0.35)',
        font: { size: 11 },
        callback: (v: number) => activeTab.value === 'Revenue' ? `$${(v / 1000).toFixed(0)}K` : v,
      },
      border: { color: 'rgba(255,255,255,0.06)' },
    },
  },
}
</script>

<style scoped>
.chart-wrap {
  border-radius: 16px;
  padding: 24px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

.chart-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
}

.chart-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 3px;
}

.chart-tab {
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  border: none;
  background: none;
  transition: all 0.2s;
  font-family: inherit;
}

.chart-tab.active {
  background: rgba(124, 58, 237, 0.25);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.chart-body {
  height: 260px;
  position: relative;
}
</style>
