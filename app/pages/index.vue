<template>
  <div class="dashboard-page">
    <!-- Top Welcome Banner -->
    <div class="welcome-banner glass">
      <div class="welcome-text">
        <h1 class="welcome-title">
          Welcome back, <span class="gradient-text">Alex</span> 👋
        </h1>
        <p class="welcome-desc">
          Here is your online academy sales summary and student activity for
          this month.
        </p>
      </div>

      <div class="banner-actions">
        <button
          type="button"
          class="banner-btn-secondary"
          :disabled="isRefreshing"
          @click="refresh()"
        >
          <RefreshCw :size="15" :class="{ 'animate-spin': isRefreshing }" />
          <span>{{ isRefreshing ? "Refreshing..." : "Refresh" }}</span>
        </button>

        <NuxtLink to="/courses" class="banner-btn-primary">
          <Plus :size="16" />
          <span>New Course</span>
        </NuxtLink>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <KpiCard
        label="Total Revenue"
        :value="kpis.totalRevenue"
        format="currency"
        sub="All-time platform revenue"
        :icon="DollarSign"
        accent-color="#8b5cf6"
        :trend="kpis.revenueGrowth"
      />
      <KpiCard
        label="Total Enrolled Students"
        :value="kpis.totalStudents"
        format="number"
        sub="Active learning accounts"
        :icon="Users"
        accent-color="#3b82f6"
        :trend="kpis.studentGrowth"
      />
      <KpiCard
        label="Active Courses"
        :value="`${kpis.publishedCourses} / ${kpis.totalCourses}`"
        sub="Published vs Total created"
        :icon="BookOpen"
        accent-color="#10b981"
      />
      <KpiCard
        label="Student Satisfaction"
        :value="kpis.avgRating"
        format="rating"
        sub="Average verified course rating"
        :icon="Star"
        accent-color="#f59e0b"
      />
    </div>

    <!-- Charts & Category Breakdown -->
    <div class="charts-grid">
      <!-- Main Sales Chart -->
      <div class="main-chart-col">
        <SalesChart
          title="Revenue & Enrollment Performance"
          subtitle="Monthly breakdown over the last 12 active billing periods"
          :months="charts.months"
          :monthly-revenue="charts.monthlyRevenue"
          :monthly-enrollments="charts.monthlyEnrollments"
        />
      </div>

      <!-- Category Revenue Breakdown -->
      <div class="category-breakdown-card glass">
        <div class="card-title-row">
          <div>
            <h3 class="breakdown-title">Revenue by Category</h3>
            <p class="breakdown-sub">Category distribution</p>
          </div>
          <Tag :size="18" class="text-violet-400" />
        </div>

        <div class="category-list">
          <div
            v-for="(amount, cat) in charts.revenueByCategory"
            :key="cat"
            class="category-item"
          >
            <div class="cat-header">
              <span class="cat-name">{{ cat }}</span>
              <span class="cat-amount"
                >${{ Number(amount).toLocaleString() }}</span
              >
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{
                  width: `${kpis.totalRevenue ? Math.min(100, Math.round((Number(amount) / kpis.totalRevenue) * 100)) : 0}%`,
                  background: getCategoryColor(String(cat)),
                }"
              ></div>
            </div>
            <div class="cat-percentage">
              {{
                kpis.totalRevenue
                  ? Math.round((Number(amount) / kpis.totalRevenue) * 100)
                  : 0
              }}% of total revenue
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Top Courses & Recent Enrollments -->
    <div class="bottom-grid">
      <!-- Top Performing Courses -->
      <div class="top-courses-card glass">
        <div class="card-title-row">
          <div>
            <h3 class="breakdown-title">Top Performing Courses</h3>
            <p class="breakdown-sub">Highest revenue generating programs</p>
          </div>
          <NuxtLink to="/courses" class="card-link">
            <span>View All</span>
            <ArrowRight :size="14" />
          </NuxtLink>
        </div>

        <div class="top-courses-list">
          <NuxtLink
            v-for="(course, index) in topCourses"
            :key="course.slug"
            :to="`/courses/${course.slug}`"
            class="top-course-item"
          >
            <div class="rank-badge" :class="`rank-${index + 1}`">
              #{{ index + 1 }}
            </div>
            <div class="course-meta">
              <span class="top-title">{{ course.title }}</span>
              <div class="top-sub-meta">
                <span class="top-students">
                  <Users :size="12" />
                  {{ course.totalStudents.toLocaleString() }} students
                </span>
                <span class="top-rating">
                  <Star :size="12" class="fill-amber-400 text-amber-400" />
                  {{ course.rating }}
                </span>
              </div>
            </div>
            <div class="course-revenue">
              <span class="rev-val"
                >${{ (course.revenue / 1000).toFixed(1) }}K</span
              >
              <span class="rev-lbl">Revenue</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Enrollments Table -->
      <div class="recent-table-col">
        <RecentEnrollmentsTable :enrollments="recentEnrollments" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  RefreshCw,
  Plus,
  Tag,
  ArrowRight,
} from "lucide-vue-next";
import KpiCard from "~/components/dashboard/KpiCard.vue";
import SalesChart from "~/components/dashboard/SalesChart.vue";
import RecentEnrollmentsTable from "~/components/dashboard/RecentEnrollmentsTable.vue";
import { useDashboardStats } from "~/composables/useDashboardStats";

definePageMeta({ requiresAdmin: true })

useHead({
  title: "Dashboard Overview",
});

const {
  kpis,
  charts,
  topCourses,
  recentEnrollments,
  isRefreshing,
  refresh,
} = useDashboardStats();

function getCategoryColor(cat: string) {
  const map: Record<string, string> = {
    "Web Development": "linear-gradient(90deg, #7c3aed, #6366f1)",
    Programming: "linear-gradient(90deg, #2563eb, #38bdf8)",
    Design: "linear-gradient(90deg, #ec4899, #f43f5e)",
    DevOps: "linear-gradient(90deg, #10b981, #34d399)",
    Backend: "linear-gradient(90deg, #f59e0b, #fbbf24)",
  };
  return map[cat] || "linear-gradient(90deg, #8b5cf6, #3b82f6)";
}
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-banner {
  border-radius: 20px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  border: 1px solid rgba(124, 58, 237, 0.2);
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.08) 0%,
    rgba(37, 99, 235, 0.04) 100%
  );
}

.welcome-title {
  font-size: 24px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.5px;
}

.welcome-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-btn-secondary {
  display: flex;
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

.banner-btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.banner-btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.banner-btn-primary:hover {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.35);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.main-chart-col {
  min-width: 0;
}

.category-breakdown-card {
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.breakdown-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

.breakdown-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cat-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 99px;
  margin: 6px 0 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.cat-percentage {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

.top-courses-card {
  border-radius: 16px;
  padding: 24px;
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

.top-courses-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-course-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-decoration: none;
  transition: all 0.2s;
}

.top-course-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(124, 58, 237, 0.3);
  transform: translateX(3px);
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.rank-1 {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.35);
}

.rank-2 {
  background: rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.rank-3 {
  background: rgba(249, 115, 22, 0.2);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.35);
}

.course-meta {
  flex: 1;
  min-width: 0;
}

.top-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-sub-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}

.top-students,
.top-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.course-revenue {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.rev-val {
  font-size: 14px;
  font-weight: 700;
  color: #34d399;
}

.rev-lbl {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
