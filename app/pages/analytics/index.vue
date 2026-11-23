<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Sales & Learner Analytics') }}</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">
          {{ t('Deep-dive analysis of course demand, monthly revenue velocity, and learner conversion rates.') }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
        :disabled="isRefreshing"
        @click="refresh()"
      >
        <RefreshCw :size="15" :class="{ 'animate-spin': isRefreshing }" />
        <span>{{ isRefreshing ? t('Refreshing...') : t('Refresh Metrics') }}</span>
      </button>
    </div>

    <!-- Analytics Stat Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        :label="t('Total Gross Revenue')"
        :value="kpis.totalRevenue"
        format="currency"
        :sub="t('All-time platform revenue')"
        :icon="TrendingUp"
        accent-color="#8b5cf6"
        :trend="kpis.revenueGrowth"
      />
      <StatCard
        :label="t('Average Order Value')"
        :value="avgOrderValue"
        format="currency"
        :sub="t('Per transaction across all courses')"
        :icon="CreditCard"
        accent-color="#3b82f6"
      />
      <StatCard
        :label="t('Total Enrolled Students')"
        :value="kpis.totalStudents"
        format="number"
        :sub="t('Cumulative learning accounts')"
        :icon="Target"
        accent-color="#10b981"
        :trend="kpis.studentGrowth"
      />
      <StatCard
        :label="t('Average Course Rating')"
        :value="kpis.avgRating"
        format="rating"
        :sub="t('Calculated across verified student reviews')"
        :icon="Award"
        accent-color="#f59e0b"
      />
    </div>

    <!-- Charts -->
    <SalesChart
      :title="t('12-Month Sales & Student Acquisition Velocity')"
      subtitle="Historical monthly comparisons across gross billing and enrolled headcount"
      :months="charts.months"
      :monthly-revenue="charts.monthlyRevenue"
      :monthly-enrollments="charts.monthlyEnrollments"
    />

    <!-- Category Performance Table -->
    <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
      <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Category Revenue Contribution') }}</h3>
          <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">{{ t('Volume and financial breakdown per subject vertical') }}</p>
        </div>
        <NuxtLink to="/courses" class="flex items-center gap-1 text-xs font-semibold text-brand-300 no-underline transition-colors hover:text-brand-200 light:text-brand-700 light:hover:text-brand-800">
          <span>{{ t('Manage Courses') }}</span>
          <ArrowRight :size="14" />
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px] border-collapse text-left text-[13px]">
          <thead>
            <tr>
              <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">{{ t('Vertical') }}</th>
              <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">{{ t('Total Generated') }}</th>
              <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">{{ t('Share of Gross Revenue') }}</th>
              <th class="hidden border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase sm:table-cell light:border-slate-200 light:text-slate-500">{{ t('Status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(amount, cat) in charts.revenueByCategory" :key="cat" class="transition-colors hover:bg-white/3 light:hover:bg-slate-50">
              <td class="border-b border-white/4 px-3 py-3.5 light:border-slate-100">
                <span class="font-semibold text-brand-300 light:text-brand-700">{{ cat }}</span>
              </td>
              <td class="border-b border-white/4 px-3 py-3.5 light:border-slate-100">
                <span class="font-bold whitespace-nowrap text-emerald-400 light:text-emerald-700">${{ Number(amount).toLocaleString() }}</span>
              </td>
              <td class="border-b border-white/4 px-3 py-3.5 light:border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="h-1.5 max-w-45 flex-1 overflow-hidden rounded-full bg-white/6 light:bg-slate-200">
                    <div
                      class="h-full rounded-full bg-brand-500 transition-[width] duration-500"
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
                  {{ t('Performing') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Catalog funnel and retention cohorts -->
    <FunnelAnalytics />
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
import FunnelAnalytics from '~/components/dashboard/FunnelAnalytics.vue'
import { useDashboardStats } from '~/composables/useDashboardStats'

const { t } = useT()

definePageMeta({ requiresAdmin: true })

useHead({
  title: t('Sales & Learner Analytics')
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
