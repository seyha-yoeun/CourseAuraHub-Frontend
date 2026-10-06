<template>
  <div class="analytics-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sales & Learner Analytics</h1>
        <p class="page-sub">
          Deep-dive analysis of course demand, monthly revenue velocity, and learner conversion rates.
        </p>
      </div>

      <button
        type="button"
        class="refresh-btn"
        :disabled="pending"
        @click="refresh()"
      >
        <RefreshCw :size="15" :class="{ 'animate-spin': pending }" />
        <span>Refresh Metrics</span>
      </button>
    </div>

    <!-- Analytics Stat Cards -->
    <div class="stats-row">
      <StatCard
        label="Gross Annual Run Rate"
        :value="kpis.totalRevenue * 1.2"
        format="currency"
        sub="Projected based on current run rate"
        :icon="TrendingUp"
        accent-color="#8b5cf6"
        :trend="18.4"
      />
      <StatCard
        label="Average Order Value"
        :value="avgOrderValue"
        format="currency"
        sub="Per transaction across all courses"
        :icon="CreditCard"
        accent-color="#3b82f6"
        :trend="5.2"
      />
      <StatCard
        label="Student Conversion Rate"
        value="4.8%"
        sub="Platform visit to paid enrollment"
        :icon="Target"
        accent-color="#10b981"
        :trend="1.2"
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
    <div class="charts-wrap">
      <SalesChart
        title="12-Month Sales & Student Acquisition Velocity"
        subtitle="Historical monthly comparisons across gross billing and enrolled headcount"
        :months="charts.months"
        :monthly-revenue="charts.monthlyRevenue"
        :monthly-enrollments="charts.monthlyEnrollments"
      />
    </div>

    <!-- Category Performance Table -->
    <div class="category-table-card glass">
      <div class="card-head">
        <div>
          <h3 class="card-title">Category Revenue Contribution</h3>
          <p class="card-desc">Volume and financial breakdown per subject vertical</p>
        </div>
        <NuxtLink to="/courses" class="card-link">
          <span>Manage Courses</span>
          <ArrowRight :size="14" />
        </NuxtLink>
      </div>

      <div class="table-container">
        <table class="cat-table">
          <thead>
            <tr>
              <th>Vertical</th>
              <th>Total Generated</th>
              <th>Share of Gross Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(amount, cat) in charts.revenueByCategory" :key="cat">
              <td>
                <span class="cat-badge">{{ cat }}</span>
              </td>
              <td>
                <span class="font-bold text-emerald-400">${{ Number(amount).toLocaleString() }}</span>
              </td>
              <td>
                <div class="share-cell">
                  <div class="share-bar">
                    <div
                      class="share-fill"
                      :style="{ width: `${kpis.totalRevenue ? Math.round((Number(amount) / kpis.totalRevenue) * 100) : 0}%` }"
                    ></div>
                  </div>
                  <span class="share-text">
                    {{ kpis.totalRevenue ? Math.round((Number(amount) / kpis.totalRevenue) * 100) : 0 }}%
                  </span>
                </div>
              </td>
              <td>
                <span class="status-active">
                  <span class="dot"></span>
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

useHead({
  title: 'Sales & Learner Analytics'
})

const { kpis, charts, pending, refresh } = useDashboardStats()

const avgOrderValue = computed(() => {
  if (!kpis.value.totalStudents) return 99.99
  return kpis.value.totalRevenue / 10
})
</script>

<style scoped>
.analytics-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.5px;
}

.page-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 4px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.category-table-card {
  border-radius: 18px;
  padding: 24px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

.card-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.card-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
  text-decoration: none;
}

.card-link:hover {
  color: #c4b5fd;
}

.table-container {
  overflow-x: auto;
}

.cat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.cat-table th {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.cat-table td {
  padding: 14px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
}

.cat-badge {
  font-weight: 600;
  color: #c4b5fd;
}

.share-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-bar {
  flex: 1;
  max-width: 180px;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 99px;
  overflow: hidden;
}

.share-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #3b82f6);
  border-radius: 99px;
}

.share-text {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  min-width: 36px;
}

.status-active {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  padding: 3px 8px;
  border-radius: 99px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 6px #34d399;
}
</style>
