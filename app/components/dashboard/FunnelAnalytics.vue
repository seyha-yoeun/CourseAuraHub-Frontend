<template>
  <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
    <!-- Enrollment funnel -->
    <section :class="cardClass">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 :class="sectionTitle">Enrollment Funnel</h2>
          <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">Visitors who viewed a course, carted it and started checkout, then learners who enrolled and how far they got.</p>
        </div>
      </div>

      <!-- Filters sit in one row above the chart -->
      <div class="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label :class="labelClass" :for="`${uid}-from`">From</label>
          <input :id="`${uid}-from`" v-model="from" type="date" :max="to || undefined" class="w-38" :class="inputClass">
        </div>
        <div>
          <label :class="labelClass" :for="`${uid}-to`">To</label>
          <input :id="`${uid}-to`" v-model="to" type="date" :min="from || undefined" class="w-38" :class="inputClass">
        </div>
        <div class="min-w-48 flex-1">
          <span :class="labelClass">Course</span>
          <AppDropdown :model-value="course" :options="courseOptions" size="sm" aria-label="Funnel for a course" @update:model-value="value => course = String(value)" />
        </div>
      </div>

      <div v-if="funnelPending" class="mt-4 flex flex-col gap-2.5">
        <div v-for="i in 5" :key="i" class="h-8 animate-pulse rounded-md bg-white/5 light:bg-slate-100" />
      </div>
      <p v-else-if="funnelError" class="mt-4 text-xs text-rose-400">{{ getErrorMessage(funnelError, 'Unable to load the enrollment funnel') }}</p>
      <p v-else-if="!steps.length || !steps[0]?.count" class="mt-4 text-xs text-white/45 light:text-slate-500">No activity in this range yet.</p>
      <ol v-else class="m-0 mt-4 flex list-none flex-col gap-3 p-0" :aria-label="`Enrollment funnel, ${funnel?.from} to ${funnel?.to}`">
        <li v-for="step in steps" :key="step.key" class="group">
          <div class="flex items-baseline justify-between gap-3 text-xs">
            <span class="font-semibold text-slate-100 light:text-slate-900">{{ step.label }}</span>
            <span class="text-white/55 light:text-slate-500">
              <span class="font-bold text-slate-100 light:text-slate-900">{{ step.count.toLocaleString() }}</span>
              <template v-if="step.fromPrevious !== null"> · {{ formatPercent(step.fromPrevious) }} of previous</template>
            </span>
          </div>
          <!-- The track is the hit target; the bar's rounded end sits at its value -->
          <div class="mt-1.5 h-3 rounded-full bg-white/6 py-0 light:bg-slate-100" :title="`${step.label}: ${step.count.toLocaleString()} (${formatPercent(step.fromFirst ?? 100)} of the first step)`">
            <div class="h-full rounded-full bg-violet-500 transition-[width] duration-500 group-hover:bg-violet-400 light:bg-violet-600 light:group-hover:bg-violet-700" :style="{ width: barWidth(step) }" />
          </div>
        </li>
      </ol>
    </section>

    <!-- Retention cohorts -->
    <section :class="cardClass">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 :class="sectionTitle">Learner Retention</h2>
          <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">Learners by the month they joined, and the share who completed a lesson in each month since.</p>
        </div>
        <div class="w-36">
          <AppDropdown :model-value="months" :options="monthOptions" size="sm" aria-label="Number of cohorts" @update:model-value="value => months = Number(value)" />
        </div>
      </div>

      <div v-if="retentionPending" class="mt-4 h-48 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
      <p v-else-if="retentionError" class="mt-4 text-xs text-rose-400">{{ getErrorMessage(retentionError, 'Unable to load retention') }}</p>
      <p v-else-if="!cohorts.length" class="mt-4 text-xs text-white/45 light:text-slate-500">No learners have joined in this period.</p>
      <div v-else class="mt-4 overflow-x-auto">
        <table class="w-full border-separate border-spacing-0.5 text-center text-[11px]">
          <caption class="sr-only">Share of each monthly cohort active in the months after joining</caption>
          <thead>
            <tr class="text-white/45 light:text-slate-500">
              <th scope="col" class="px-2 py-1.5 text-left font-semibold">Joined</th>
              <th scope="col" class="px-2 py-1.5 text-right font-semibold">Learners</th>
              <th v-for="offset in maxOffset + 1" :key="offset" scope="col" class="min-w-11 px-1 py-1.5 font-semibold">M{{ offset - 1 }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cohort in cohorts" :key="cohort.month">
              <th scope="row" class="px-2 py-1.5 text-left font-semibold whitespace-nowrap text-slate-100 light:text-slate-900">{{ formatMonth(cohort.month) }}</th>
              <td class="px-2 py-1.5 text-right text-white/60 light:text-slate-600">{{ cohort.learners }}</td>
              <td
                v-for="offset in maxOffset + 1"
                :key="offset"
                class="rounded-md px-1 py-1.5 font-semibold"
                :class="cellText(cell(cohort, offset - 1)?.rate)"
                :style="{ backgroundColor: cellColor(cell(cohort, offset - 1)?.rate) }"
                :title="cell(cohort, offset - 1) ? `${formatMonth(cohort.month)}, month ${offset - 1}: ${cell(cohort, offset - 1)!.active} of ${cohort.learners} active (${formatPercent(cell(cohort, offset - 1)!.rate ?? 0)})` : undefined"
              >
                {{ cell(cohort, offset - 1) ? formatPercent(cell(cohort, offset - 1)!.rate ?? 0, 0) : '' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-white/45 light:text-slate-500" aria-hidden="true">
          <span>0%</span>
          <span v-for="stop in [0.1, 0.3, 0.5, 0.7, 0.9]" :key="stop" class="size-3 rounded-sm" :style="{ backgroundColor: cellColor(stop * 100) }" />
          <span>100%</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Course } from '~/types'
import type { FunnelStep, RetentionCohort } from '~/types/funnel'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useFunnelAnalytics } from '~/composables/useFunnelAnalytics'
import { getErrorMessage } from '~/utils/apiError'
import { cardClass, inputClass, labelClass, sectionTitle } from '~/utils/ui'

/** Admin-only: the catalog-to-completion funnel and monthly retention cohorts. Aggregates only. */
const uid = `funnel-${useId()}`
const { fetchFunnel, fetchRetention } = useFunnelAnalytics()

// The backend defaults to the last 30 days; empty dates keep that default
const from = ref('')
const to = ref('')
const ALL = 'all'
const course = ref(ALL)

const { data: courses } = await useAsyncData('funnel-courses', () => $fetch<Course[]>('/api/courses').catch(() => [] as Course[]), { server: false })
const courseOptions = computed(() => [
  { value: ALL, label: 'All courses' },
  ...(courses.value ?? []).map(item => ({ value: item.slug, label: item.title })),
])

const { data: funnel, pending: funnelPending, error: funnelError } = await useAsyncData(
  'admin-funnel',
  () => fetchFunnel(from.value || undefined, to.value || undefined, course.value === ALL ? null : course.value),
  { server: false, watch: [from, to, course] },
)
const steps = computed(() => funnel.value?.steps ?? [])

function barWidth(step: FunnelStep) {
  const first = steps.value[0]?.count ?? 0
  return first ? `${Math.max(1.5, (step.count / first) * 100)}%` : '0%'
}

const months = ref(6)
const monthOptions = [6, 12, 24].map(value => ({ value, label: `${value} months` }))
const { data: retention, pending: retentionPending, error: retentionError } = await useAsyncData(
  'admin-retention',
  () => fetchRetention(months.value),
  { server: false, watch: [months] },
)
const cohorts = computed(() => retention.value?.cohorts ?? [])
const maxOffset = computed(() => Math.max(0, ...cohorts.value.flatMap(cohort => cohort.months.map(month => month.offset))))

function cell(cohort: RetentionCohort, offset: number) {
  return cohort.months.find(month => month.offset === offset)
}

// One hue, light to dark by share: a sequential scale, never a rainbow
function cellColor(rate: number | null | undefined) {
  if (rate === null || rate === undefined) return 'transparent'
  const alpha = 0.08 + Math.min(1, Math.max(0, Number(rate) / 100)) * 0.82
  return `rgba(124, 58, 237, ${alpha.toFixed(2)})`
}

function cellText(rate: number | null | undefined) {
  if (rate === null || rate === undefined) return ''
  return Number(rate) >= 45 ? 'text-white' : 'text-slate-100 light:text-slate-800'
}

function formatPercent(value: number, digits = 1) {
  return `${Number(value).toFixed(digits)}%`
}

function formatMonth(month: string) {
  const [year, number] = month.split('-').map(Number)
  if (!year || !number) return month
  return new Date(Date.UTC(year, number - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>
