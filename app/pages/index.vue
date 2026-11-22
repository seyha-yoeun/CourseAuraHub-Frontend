<template>
  <div class="flex flex-col gap-6">
    <!-- Top Welcome Banner -->
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-brand-500/20 bg-brand-600/8 p-5 backdrop-blur-md sm:p-6 lg:px-7 light:border-brand-200 light:from-brand-50 light:to-white">
      <div>
        <h1 class="text-xl font-extrabold tracking-tight text-slate-50 sm:text-2xl light:text-slate-900">
          Welcome back,
          <span class="bg-linear-to-r from-brand-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent light:from-brand-600 light:via-blue-600 light:to-emerald-600">{{ auth.userName || 'Account' }}</span>
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
          class="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
          :disabled="isRefreshing"
          @click="refresh()"
        >
          <RefreshCw :size="15" :class="{ 'animate-spin': isRefreshing }" />
          <span>{{ isRefreshing ? "Refreshing..." : "Refresh" }}</span>
        </button>

        <NuxtLink
          to="/courses"
          class="flex items-center gap-1.5 rounded-[10px] border border-brand-500/40 bg-brand-500 px-4.5 py-2.25 text-[13px] font-semibold text-white no-underline transition-all hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
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
          <Tag :size="18" class="text-brand-400" />
        </div>

        <!-- Top categories always; the rest expand in place -->
        <ul class="m-0 flex list-none flex-col gap-3.5 p-0">
          <li v-for="category in topCategories" :key="category.name">
            <div class="flex items-baseline justify-between gap-3 text-[13px]">
              <span class="min-w-0 truncate font-medium text-slate-200 light:text-slate-800">{{ category.name }}</span>
              <span class="shrink-0 tabular-nums">
                <span class="font-semibold text-slate-100 light:text-slate-900">{{ formatMoney(category.amount) }}</span>
                <span class="ml-1.5 text-[12px] text-white/40 light:text-slate-400">{{ category.share }}%</span>
              </span>
            </div>
            <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/6 light:bg-slate-100">
              <div class="h-full rounded-full bg-brand-400 transition-[width] duration-700 ease-out light:bg-brand-500" :style="{ width: `${category.share}%` }" />
            </div>
          </li>
        </ul>

        <div
          v-if="moreCategories.length"
          id="more-categories"
          class="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          :class="showAllCategories ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          :inert="!showAllCategories || undefined"
        >
          <ul class="m-0 flex min-h-0 list-none flex-col gap-3.5 overflow-hidden p-0" :class="showAllCategories && 'pt-3.5'">
            <li v-for="category in moreCategories" :key="category.name">
              <div class="flex items-baseline justify-between gap-3 text-[13px]">
                <span class="min-w-0 truncate font-medium text-slate-200 light:text-slate-800">{{ category.name }}</span>
                <span class="shrink-0 tabular-nums">
                  <span class="font-semibold text-slate-100 light:text-slate-900">{{ formatMoney(category.amount) }}</span>
                  <span class="ml-1.5 text-[12px] text-white/40 light:text-slate-400">{{ category.share }}%</span>
                </span>
              </div>
              <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/6 light:bg-slate-100">
                <div class="h-full rounded-full bg-brand-400/70 transition-[width] duration-700 ease-out light:bg-brand-500/70" :style="{ width: `${category.share}%` }" />
              </div>
            </li>
          </ul>
        </div>

        <button
          v-if="moreCategories.length"
          type="button"
          class="mt-4 inline-flex cursor-pointer items-center gap-1 self-start rounded-md text-[13px] font-semibold text-brand-300 transition-colors hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-brand-600 light:hover:text-brand-700"
          :aria-expanded="showAllCategories"
          aria-controls="more-categories"
          @click="showAllCategories = !showAllCategories"
        >
          {{ showAllCategories ? 'Show top 5' : `Show all ${allCategories.length} categories` }}
          <ChevronDown :size="15" aria-hidden="true" class="transition-transform duration-200" :class="showAllCategories && 'rotate-180'" />
        </button>
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
          <NuxtLink to="/courses" class="flex items-center gap-1 text-xs font-semibold text-brand-300 no-underline transition-colors hover:text-brand-200 light:text-brand-700 light:hover:text-brand-800">
            <span>View All</span>
            <ArrowRight :size="14" />
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-2.5">
          <NuxtLink
            v-for="(course, index) in topCourses"
            :key="course.slug"
            :to="`/courses/${course.slug}`"
            class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 px-3 py-2.5 no-underline transition-all hover:translate-x-0.75 hover:border-brand-500/30 hover:bg-white/6 light:border-slate-100 light:bg-slate-50 light:hover:bg-slate-100"
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
  ChevronDown,
} from "lucide-vue-next";
import KpiCard from "~/components/dashboard/KpiCard.vue";
import SalesChart from "~/components/dashboard/SalesChart.vue";
import RecentEnrollmentsTable from "~/components/dashboard/RecentEnrollmentsTable.vue";
import { useDashboardStats } from "~/composables/useDashboardStats";

definePageMeta({ requiresAdmin: true })

useHead({
  title: "Dashboard Overview",
});

const auth = useAuth()

const {
  kpis,
  charts,
  topCourses,
  recentEnrollments,
  isRefreshing,
  refresh,
} = useDashboardStats();

// Revenue by category: biggest first, top 5 shown, the rest behind "Show all".
const TOP_CATEGORY_COUNT = 5
const showAllCategories = ref(false)

const allCategories = computed(() => Object.entries(charts.value.revenueByCategory ?? {})
  .map(([name, amount]) => {
    const value = Number(amount) || 0
    return {
      name,
      amount: value,
      share: kpis.value.totalRevenue ? Math.min(100, Math.round((value / kpis.value.totalRevenue) * 100)) : 0,
    }
  })
  .sort((a, b) => b.amount - a.amount))

const topCategories = computed(() => allCategories.value.slice(0, TOP_CATEGORY_COUNT))
const moreCategories = computed(() => allCategories.value.slice(TOP_CATEGORY_COUNT))

const moneyFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
function formatMoney(value: number) {
  return moneyFormat.format(value)
}

function rankClass(index: number) {
  if (index === 0) return "border-amber-400/35 bg-amber-400/20 text-amber-300 light:border-amber-300 light:bg-amber-50 light:text-amber-700";
  if (index === 1) return "border-slate-400/35 bg-slate-400/20 text-slate-300 light:border-slate-300 light:bg-slate-100 light:text-slate-600";
  if (index === 2) return "border-orange-500/35 bg-orange-500/20 text-orange-300 light:border-orange-200 light:bg-orange-50 light:text-orange-700";
  return "border-transparent bg-white/5 text-white/60 light:bg-slate-100 light:text-slate-500";
}
</script>
