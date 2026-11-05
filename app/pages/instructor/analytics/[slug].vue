<template>
  <div class="flex flex-col gap-5">
    <NuxtLink :to="backLink" class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-300 no-underline hover:text-violet-200 light:text-violet-700">
      <ArrowLeft :size="15" /> {{ t('Back to course') }}
    </NuxtLink>

    <div v-if="pending" class="flex flex-col gap-4">
      <div class="h-24 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
      <div class="h-80 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error || !data" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">
      {{ getErrorMessage(error, t('Unable to load course analytics')) }}
    </p>

    <template v-else>
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ data.title }}</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Where learners progress, where they stop, and how they score. Totals only, no personal details.') }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard :label="t('Learners enrolled')" :value="data.learners.enrolled" :sub="t('{count} completed', { count: data.learners.completed })" :icon="Users" accent-color="#3b82f6" />
        <StatCard :label="t('Completion rate')" :value="data.learners.completionRate" format="percent" :sub="t('Finished every lesson')" :icon="GraduationCap" accent-color="#10b981" />
        <StatCard :label="t('Average rating')" :value="data.reviews.averageRating" format="rating" :sub="t('{count} reviews', { count: data.reviews.count })" :icon="Star" accent-color="#f59e0b" />
        <StatCard :label="t('Submissions to grade')" :value="data.assignments.pendingReview" :sub="gradedSub" :icon="ClipboardCheck" accent-color="#7c3aed" />
      </div>

      <!-- Lesson funnel -->
      <section class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
        <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Lesson funnel') }}</h2>
        <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ t('Share of enrolled learners who completed each lesson, in curriculum order.') }}</p>

        <p v-if="!data.lessons.length" class="mt-4 text-xs text-white/45 light:text-slate-500">{{ t('This course has no lessons yet.') }}</p>
        <div v-else class="mt-4 overflow-x-auto">
          <table class="w-full min-w-170 border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
                <th class="py-2 pr-3 font-semibold">{{ t('Lesson') }}</th>
                <th class="w-56 py-2 pr-3 font-semibold">{{ t('Completed') }}</th>
                <th class="py-2 pr-3 font-semibold">{{ t('Drop-off') }}</th>
                <th class="py-2 font-semibold">{{ t('Details') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="lesson in data.lessons"
                :key="lesson.lessonId"
                class="border-b border-white/5 last:border-0 light:border-slate-100"
                :class="lesson.lessonId === biggestDropId ? 'bg-rose-500/6 light:bg-rose-50/70' : ''"
              >
                <td class="py-2.5 pr-3 align-top">
                  <p class="flex items-center gap-1.5 font-semibold text-slate-100 light:text-slate-900">
                    <component :is="typeIcon(lesson.type)" :size="13" class="shrink-0 text-white/40 light:text-slate-400" />
                    {{ lesson.title }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-white/35 light:text-slate-400">{{ lesson.section }}</p>
                </td>
                <td class="py-2.5 pr-3 align-top">
                  <ProgressBar :value="lesson.completionRate" />
                  <p class="mt-1 text-[11px] text-white/40 light:text-slate-500">{{ t('{count} learners', { count: lesson.completedLearners }) }}</p>
                </td>
                <td class="py-2.5 pr-3 align-top">
                  <span
                    class="font-semibold"
                    :class="lesson.lessonId === biggestDropId ? 'text-rose-300 light:text-rose-600' : 'text-white/60 light:text-slate-600'"
                  >
                    {{ lesson.dropOff > 0 ? `−${lesson.dropOff}%` : '—' }}
                  </span>
                  <p v-if="lesson.lessonId === biggestDropId" class="mt-0.5 text-[11px] text-rose-300/80 light:text-rose-600">{{ t('Biggest drop') }}</p>
                </td>
                <td class="py-2.5 align-top text-white/60 light:text-slate-600">
                  <p v-if="lesson.video">
                    {{ t('{count} watching', { count: lesson.video.learnersWatching }) }}<template v-if="lesson.video.averageWatchSeconds !== null"> · {{ t('avg. {time} in', { time: formatSeconds(lesson.video.averageWatchSeconds) }) }}</template>
                  </p>
                  <p v-if="lesson.quiz">
                    <template v-if="lesson.quiz.attempts">
                      {{ t('{rate}% pass · avg. score {score}% · {tries} tries each', { rate: lesson.quiz.passRate, score: lesson.quiz.averageScore ?? 0, tries: lesson.quiz.averageAttemptsPerLearner }) }}
                    </template>
                    <template v-else>{{ t('No quiz attempts yet') }}</template>
                  </p>
                  <span v-if="!lesson.video && !lesson.quiz">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SalesChart
          :title="t('Enrollments and revenue')"
          :subtitle="t('By month of the year')"
          :months="MONTHS"
          :monthly-revenue="data.monthly.map(m => m.revenue)"
          :monthly-enrollments="data.monthly.map(m => m.enrollments)"
        />

        <!-- Rating distribution -->
        <section class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
          <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Ratings') }}</h2>
          <ul class="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
            <li v-for="stars in [5, 4, 3, 2, 1]" :key="stars" class="flex items-center gap-2.5 text-xs">
              <span class="flex w-8 shrink-0 items-center gap-0.5 font-semibold text-white/70 light:text-slate-700">{{ stars }}<Star :size="11" class="fill-amber-400 text-amber-400" /></span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/8 light:bg-slate-100">
                <div class="h-full rounded-full bg-amber-400" :style="{ width: `${ratingShare(stars)}%` }" />
              </div>
              <span class="w-8 shrink-0 text-right text-white/45 light:text-slate-500">{{ data.reviews.distribution[stars] ?? 0 }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ClipboardCheck, FileText, GraduationCap, HelpCircle, PlayCircle, Star, Users } from 'lucide-vue-next'
import type { LessonFunnel } from '~/types/analytics'
import StatCard from '~/components/shared/StatCard.vue'
import SalesChart from '~/components/dashboard/SalesChart.vue'
import ProgressBar from '~/components/learning/ProgressBar.vue'
import { useInstructor } from '~/composables/useInstructor'
import { getErrorMessage } from '~/utils/apiError'

definePageMeta({ requiresStaff: true })

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const { t } = useT()
const auth = useAuth()
const route = useRoute()
const { fetchAnalytics } = useInstructor()
const slug = computed(() => String(route.params.slug))

const { data, pending, error } = await useAsyncData(
  () => `course-analytics-${slug.value}`,
  () => fetchAnalytics(slug.value),
  { server: false, watch: [slug] }
)

useHead({ title: computed(() => data.value ? `${data.value.title} · ${t('Analytics')}` : t('Analytics')) })

// Admins manage courses from the catalog page; instructors from their workspace
const backLink = computed(() => auth.isAdmin ? `/courses/${slug.value}` : `/instructor/courses/${slug.value}`)

const biggestDropId = computed(() => {
  const lessons = data.value?.lessons ?? []
  const top = lessons.reduce<LessonFunnel | null>((max, lesson) => (!max || lesson.dropOff > max.dropOff ? lesson : max), null)
  return top && top.dropOff > 0 ? top.lessonId : null
})

const gradedSub = computed(() => {
  const assignments = data.value?.assignments
  if (!assignments?.graded) return t('Nothing graded yet')
  return t('{count} graded · avg. {score}%', { count: assignments.graded, score: assignments.averageScore ?? 0 })
})

function ratingShare(stars: number) {
  const total = data.value?.reviews.count ?? 0
  return total ? Math.round(((data.value?.reviews.distribution[stars] ?? 0) / total) * 100) : 0
}

function typeIcon(type: LessonFunnel['type']) {
  if (type === 'quiz') return HelpCircle
  return type === 'video' ? PlayCircle : FileText
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = Math.round(total % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
</script>
