<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Sales &amp; Learner Analytics</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">
          Deep-dive analysis of course demand, monthly revenue velocity, and learner conversion rates.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
        :disabled="isRefreshing"
        @click="refresh()"
      >
        <RefreshCw :size="15" :class="{ 'animate-spin': isRefreshing }" />
        <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh Metrics' }}</span>
      </button>
    </div>

    <!-- Analytics Stat Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Gross Revenue"
        :value="kpis.totalRevenue"
        format="currency"
        sub="All-time platform revenue"
        :icon="TrendingUp"
        accent-color="#8b5cf6"
        :trend="kpis.revenueGrowth"
      />
      <StatCard
        label="Average Order Value"
        :value="avgOrderValue"
        format="currency"
        sub="Per transaction across all courses"
        :icon="CreditCard"
        accent-color="#3b82f6"
      />
      <StatCard
        label="Total Enrolled Students"
        :value="kpis.totalStudents"
        format="number"
        sub="Cumulative learning accounts"
        :icon="Target"
        accent-color="#10b981"
        :trend="kpis.studentGrowth"
      />
      <StatCard
        label="Average Course Rating"
        :value="kpis.avgRating"
        format="rating"
        sub="Calculated across verified student reviews"
        :icon="Award"
        accent-color="#f59e0b"
      />
    </div>

    <!-- Charts -->
    <SalesChart
      title="12-Month Sales & Student Acquisition Velocity"
      subtitle="Historical monthly comparisons across gross billing and enrolled headcount"
      :months="charts.months"
      :monthly-revenue="charts.monthlyRevenue"
      :monthly-enrollments="charts.monthlyEnrollments"
    />

    <!-- Category Performance Table -->
    <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
      <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Category Revenue Contribution</h3>
          <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Volume and financial breakdown per subject vertical</p>
        </div>
        <NuxtLink to="/courses" class="flex items-center gap-1 text-xs font-semibold text-violet-300 no-underline transition-colors hover:text-violet-200 light:text-violet-700 light:hover:text-violet-800">
          <span>Manage Courses</span>
          <ArrowRight :size="14" />
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px] border-collapse text-left text-[13px]">
          <thead>
            <tr>
              <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Vertical</th>
              <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Total Generated</th>
              <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Share of Gross Revenue</th>
              <th class="hidden border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase sm:table-cell light:border-slate-200 light:text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(amount, cat) in charts.revenueByCategory" :key="cat" class="transition-colors hover:bg-white/3 light:hover:bg-slate-50">
              <td class="border-b border-white/4 px-3 py-3.5 light:border-slate-100">
                <span class="font-semibold text-violet-300 light:text-violet-700">{{ cat }}</span>
              </td>
              <td class="border-b border-white/4 px-3 py-3.5 light:border-slate-100">
                <span class="font-bold whitespace-nowrap text-emerald-400 light:text-emerald-700">${{ Number(amount).toLocaleString() }}</span>
              </td>
              <td class="border-b border-white/4 px-3 py-3.5 light:border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="h-1.5 max-w-45 flex-1 overflow-hidden rounded-full bg-white/6 light:bg-slate-200">
                    <div
                      class="h-full rounded-full bg-linear-to-r from-violet-600 to-blue-500 transition-[width] duration-500"
                      :style="{ width: `${kpis.totalRevenue ? Math.round((Number(amount) / kpis.totalRevenue) * 100) : 0}%` }"
                    />
                  </div>
                  <span class="min-w-9 text-xs font-semibold text-white/60 light:text-slate-600">
                    {{ kpis.totalRevenue ? Math.round((Number(amount) / kpis.totalRevenue) * 100) : 0 }}%
                  </span>
                </div>
              </td>
              <td class="hidden border-b border-white/4 px-3 py-3.5 sm:table-cell light:border-slate-100">
                <span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/12 px-2 py-0.75 text-[11px] font-semibold text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700">
                  <span class="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Performing
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TrendingUp,
  CreditCard,
  Target,
  Award,
  RefreshCw,
  ArrowRight
} from 'lucide-vue-next'
import StatCard from '~/components/shared/StatCard.vue'
import SalesChart from '~/components/dashboard/SalesChart.vue'
import { useDashboardStats } from '~/composables/useDashboardStats'

definePageMeta({ requiresAdmin: true })

useHead({
  title: 'Sales & Learner Analytics'
})

const { kpis, charts, isRefreshing, refresh } = useDashboardStats()

const avgOrderValue = computed(() => {
  const totalEnrollments = charts.value.monthlyEnrollments?.reduce((sum, count) => sum + count, 0) || 0
  if (!totalEnrollments || !kpis.value.totalRevenue) {
    return kpis.value.totalStudents ? Number((kpis.value.totalRevenue / kpis.value.totalStudents).toFixed(2)) : 0
  }
  return Number((kpis.value.totalRevenue / totalEnrollments).toFixed(2))
})
</script>
