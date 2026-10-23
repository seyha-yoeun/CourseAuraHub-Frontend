<template>
  <div class="flex flex-col gap-6">
    <!-- Top Welcome Banner -->
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-violet-500/20 bg-linear-to-br from-violet-600/8 to-blue-600/4 p-5 backdrop-blur-md sm:p-6 lg:px-7 light:border-violet-200 light:from-violet-50 light:to-white">
      <div>
        <h1 class="text-xl font-extrabold tracking-tight text-slate-50 sm:text-2xl light:text-slate-900">
          Welcome back,
          <span class="bg-linear-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent light:from-violet-600 light:via-blue-600 light:to-emerald-600">Alex</span>
          👋
        </h1>
        <p class="mt-1 text-[13px] text-white/50 light:text-slate-600">
          Here is your online academy sales summary and student activity for
          this month.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
          :disabled="isRefreshing"
          @click="refresh()"
        >
          <RefreshCw :size="15" :class="{ 'animate-spin': isRefreshing }" />
          <span>{{ isRefreshing ? "Refreshing..." : "Refresh" }}</span>
        </button>

        <NuxtLink
          to="/courses"
          class="flex items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4.5 py-2.25 text-[13px] font-semibold text-white no-underline transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        >
          <Plus :size="16" />
          <span>New Course</span>
        </NuxtLink>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <!-- Main Sales Chart -->
      <div class="min-w-0 lg:col-span-2">
        <SalesChart
          title="Revenue & Enrollment Performance"
          subtitle="Monthly breakdown over the last 12 active billing periods"
          :months="charts.months"
          :monthly-revenue="charts.monthlyRevenue"
          :monthly-enrollments="charts.monthlyEnrollments"
        />
      </div>

      <!-- Category Revenue Breakdown -->
      <div class="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
        <div class="mb-5 flex items-start justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Revenue by Category</h3>
            <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Category distribution</p>
          </div>
          <Tag :size="18" class="text-violet-400" />
        </div>

        <div class="flex flex-col gap-4">
          <div
            v-for="(amount, cat) in charts.revenueByCategory"
            :key="cat"
          >
            <div class="flex justify-between text-[13px] font-semibold text-slate-200 light:text-slate-800">
              <span>{{ cat }}</span>
              <span>${{ Number(amount).toLocaleString() }}</span>
            </div>
            <div class="mt-1.5 mb-1 h-1.5 w-full overflow-hidden rounded-full bg-white/6 light:bg-slate-200">
              <div
                class="h-full rounded-full transition-[width] duration-700 ease-out"
                :class="getCategoryBarClass(String(cat))"
                :style="{ width: `${kpis.totalRevenue ? Math.min(100, Math.round((Number(amount) / kpis.totalRevenue) * 100)) : 0}%` }"
              />
            </div>
            <div class="text-[11px] text-white/40 light:text-slate-500">
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
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <!-- Top Performing Courses -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 lg:col-span-2 light:border-slate-200 light:bg-white">
        <div class="mb-5 flex items-start justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Top Performing Courses</h3>
            <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Highest revenue generating programs</p>
          </div>
          <NuxtLink to="/courses" class="flex items-center gap-1 text-xs font-semibold text-violet-300 no-underline transition-colors hover:text-violet-200 light:text-violet-700 light:hover:text-violet-800">
            <span>View All</span>
            <ArrowRight :size="14" />
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-2.5">
          <NuxtLink
            v-for="(course, index) in topCourses"
            :key="course.slug"
            :to="`/courses/${course.slug}`"
            class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 px-3 py-2.5 no-underline transition-all hover:translate-x-0.75 hover:border-violet-500/30 hover:bg-white/6 light:border-slate-100 light:bg-slate-50 light:hover:bg-slate-100"
          >
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold"
              :class="rankClass(index)"
            >
              #{{ index + 1 }}
            </div>
            <div class="min-w-0 flex-1">
              <span class="block truncate text-[13px] font-semibold text-slate-200 light:text-slate-800">{{ course.title }}</span>
              <div class="mt-0.5 flex items-center gap-2.5">
                <span class="flex items-center gap-1 text-[11px] text-white/45 light:text-slate-500">
                  <Users :size="12" />
                  {{ course.totalStudents.toLocaleString() }} students
                </span>
                <span class="flex items-center gap-1 text-[11px] text-white/45 light:text-slate-500">
                  <Star :size="12" class="fill-amber-400 text-amber-400" />
                  {{ course.rating }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-sm font-bold text-emerald-400 light:text-emerald-700">${{ (course.revenue / 1000).toFixed(1) }}K</span>
              <span class="text-[10px] text-white/40 light:text-slate-500">Revenue</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Enrollments Table -->
      <div class="min-w-0 lg:col-span-3">
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

const categoryBarClasses: Record<string, string> = {
  "Web Development": "bg-linear-to-r from-violet-600 to-indigo-500",
  Programming: "bg-linear-to-r from-blue-600 to-sky-400",
  Design: "bg-linear-to-r from-pink-500 to-rose-500",
  DevOps: "bg-linear-to-r from-emerald-500 to-emerald-400",
  Backend: "bg-linear-to-r from-amber-500 to-amber-400",
};

function getCategoryBarClass(cat: string) {
  return categoryBarClasses[cat] ?? "bg-linear-to-r from-violet-500 to-blue-500";
}

function rankClass(index: number) {
  if (index === 0) return "border-amber-400/35 bg-amber-400/20 text-amber-300 light:border-amber-300 light:bg-amber-50 light:text-amber-700";
  if (index === 1) return "border-slate-400/35 bg-slate-400/20 text-slate-300 light:border-slate-300 light:bg-slate-100 light:text-slate-600";
  if (index === 2) return "border-orange-500/35 bg-orange-500/20 text-orange-300 light:border-orange-200 light:bg-orange-50 light:text-orange-700";
  return "border-transparent bg-white/5 text-white/60 light:bg-slate-100 light:text-slate-500";
}
</script>
