<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">My Learning</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Pick up where you left off and track your progress.</p>
      </div>

      <div v-if="courses.length" class="flex gap-1 rounded-xl border border-white/8 bg-white/4 p-1 light:border-slate-200 light:bg-slate-100" role="tablist" aria-label="Filter courses">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.value"
          class="cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
          :class="activeTab === tab.value
            ? 'bg-violet-500/25 text-violet-200 light:bg-white light:text-violet-700 light:shadow-sm'
            : 'text-white/55 hover:text-white light:text-slate-600 light:hover:text-slate-900'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }} <span class="opacity-60">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <section v-if="dashboard && dashboard.enrolledCourses" aria-label="Learning overview" class="flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 light:border-slate-200 light:bg-white"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="stat.tone">
            <component :is="stat.icon" :size="18" />
          </span>
          <div class="min-w-0">
            <p class="text-xl leading-tight font-extrabold text-slate-50 light:text-slate-900">{{ stat.value }}</p>
            <p class="truncate text-[11px] text-white/45 light:text-slate-500">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
        <NuxtLink
          v-if="dashboard.continueLearning"
          :to="learnLink(dashboard.continueLearning)"
          class="group flex items-center gap-4 rounded-2xl border border-violet-500/25 bg-violet-500/8 p-4 no-underline transition-colors hover:border-violet-500/45 light:border-violet-200 light:bg-violet-50"
        >
          <img :src="dashboard.continueLearning.thumbnail" alt="" class="hidden aspect-video w-32 shrink-0 rounded-lg object-cover sm:block">
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-semibold tracking-wide text-violet-300 uppercase light:text-violet-700">Continue learning</p>
            <p class="mt-0.5 truncate text-[15px] font-bold text-slate-100 light:text-slate-900">{{ dashboard.continueLearning.title }}</p>
            <p v-if="dashboard.continueLearning.nextLesson" class="truncate text-xs text-white/50 light:text-slate-500">
              {{ dashboard.continueLearning.nextLesson.resumePositionSeconds ? `Resume at ${formatPosition(dashboard.continueLearning.nextLesson.resumePositionSeconds)}:` : 'Next:' }} {{ dashboard.continueLearning.nextLesson.title }}
            </p>
            <ProgressBar class="mt-2" :value="dashboard.continueLearning.progress.progressPercent" />
          </div>
          <PlayCircle :size="28" class="shrink-0 text-violet-300 transition-transform group-hover:scale-110 light:text-violet-600" />
        </NuxtLink>
        <div v-else class="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4 text-[13px] text-emerald-300 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700">
          <CheckCircle2 :size="20" class="shrink-0" /> You've finished every course you're enrolled in. Time to pick a new one!
        </div>

        <div class="rounded-2xl border border-white/8 bg-white/4 p-4 light:border-slate-200 light:bg-white">
          <p class="text-[11px] font-semibold text-white/45 light:text-slate-500">Lessons this week</p>
          <div class="mt-2 flex h-16 items-end gap-1.5" role="img" :aria-label="weekSummary">
            <div v-for="day in dashboard.lastSevenDays" :key="day.date" class="flex flex-1 flex-col items-center gap-1">
              <div
                class="w-full rounded-sm"
                :class="day.lessonsCompleted ? 'bg-violet-500' : 'bg-white/8 light:bg-slate-200'"
                :style="{ height: `${barHeight(day.lessonsCompleted)}px` }"
                :title="`${day.lessonsCompleted} on ${dayLabel(day.date, 'long')}`"
              />
              <span class="text-[10px] text-white/40 light:text-slate-400">{{ dayLabel(day.date, 'narrow') }}</span>
            </div>
          </div>
          <p v-if="dashboard.streak.currentDays && !dashboard.streak.activeToday" class="mt-2 text-[11px] font-semibold text-orange-400 light:text-orange-600">
            Finish a lesson today to keep your streak
          </p>
        </div>
      </div>
    </section>

    <div v-if="pending" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-80 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="rounded-[20px] border border-rose-500/25 bg-rose-500/8 px-6 py-10 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
      {{ getErrorMessage(error, 'Unable to load your courses') }}
      <button type="button" class="ml-2 cursor-pointer font-semibold underline" @click="retry">Try again</button>
    </div>

    <div v-else-if="!courses.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-violet-500/30 bg-violet-500/15">
        <GraduationCap :size="32" class="text-violet-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">You haven't enrolled in any courses yet</h3>
      <p class="mt-1.5 max-w-90 text-[13px] text-white/45 light:text-slate-500">Browse the catalog to find something you'd like to learn. Free courses can be started right away.</p>
      <NuxtLink to="/courses" class="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white no-underline">
        <BookOpen :size="16" /> Browse courses
      </NuxtLink>
    </div>

    <p v-else-if="!visibleCourses.length" class="rounded-[20px] border border-white/10 bg-white/5 px-6 py-10 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">
      No courses in this list.
    </p>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in visibleCourses"
        :key="item.courseId"
        class="group flex flex-col overflow-hidden rounded-[18px] border border-white/8 bg-zinc-950/65 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 light:border-slate-200 light:bg-white light:hover:border-violet-300"
      >
        <NuxtLink :to="`/courses/${item.slug}`" class="relative block aspect-video overflow-hidden">
          <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="size-full object-cover transition-transform duration-500 group-hover:scale-105">
          <span v-if="item.progress.completed" class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-zinc-950">
            <CheckCircle2 :size="12" /> Completed
          </span>
        </NuxtLink>

        <div class="flex flex-1 flex-col p-4.5">
          <span class="text-xs text-white/45 light:text-slate-500">{{ item.instructor }} · {{ item.level }}</span>
          <NuxtLink :to="`/courses/${item.slug}`" class="mt-1 no-underline">
            <h3 class="line-clamp-2 text-base leading-snug font-bold text-slate-100 hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ item.title }}</h3>
          </NuxtLink>

          <div class="mt-auto pt-4">
            <div class="mb-1.5 flex justify-between text-[11px] text-white/45 light:text-slate-500">
              <span>{{ item.progress.completedLessons }}/{{ item.progress.totalLessons }} lessons</span>
              <span>{{ lastActivityLabel(item) }}</span>
            </div>
            <ProgressBar :value="item.progress.progressPercent" />
            <p v-if="item.nextLesson && item.progress.completedLessons" class="mt-3 truncate text-[11px] text-white/45 light:text-slate-500">
              {{ item.nextLesson.resumePositionSeconds ? `Resume at ${formatPosition(item.nextLesson.resumePositionSeconds)}:` : 'Next:' }} {{ item.nextLesson.title }}
            </p>
            <div class="mt-4 flex gap-2">
              <NuxtLink
                :to="learnLink(item)"
                class="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-violet-500/35 bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300 no-underline transition-all hover:bg-violet-500/30 hover:text-white light:border-violet-300 light:bg-violet-50 light:text-violet-700"
              >
                <PlayCircle :size="14" />
                {{ item.progress.completed ? 'Review course' : item.progress.completedLessons ? 'Continue' : 'Start course' }}
              </NuxtLink>
              <NuxtLink
                v-if="certificateNumbers.has(item.slug)"
                :to="`/certificates/${certificateNumbers.get(item.slug)}`"
                class="flex items-center justify-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 no-underline transition-colors hover:bg-white/10 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700"
              >
                <Award :size="14" />
                Certificate
              </NuxtLink>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Award, BookOpen, CheckCircle2, Clock, Flame, GraduationCap, ListChecks, PlayCircle } from 'lucide-vue-next'
import type { MyCourse } from '~/types'
import ProgressBar from '~/components/learning/ProgressBar.vue'
import { formatPosition } from '~/composables/useCurriculum'
import { useLearning } from '~/composables/useLearning'
import { getErrorMessage } from '~/utils/apiError'

useHead({ title: 'My Learning' })

const { fetchMyCourses, fetchDashboard, fetchCertificates } = useLearning()

const { data, pending, error, refresh } = await useAsyncData('my-courses', fetchMyCourses, { server: false })
// The overview is a bonus on top of the course list, so a failure here just hides it
const { data: dashboard, refresh: refreshDashboard } = await useAsyncData('learner-dashboard', () => fetchDashboard().catch(() => null), { server: false })
const { data: certificates, refresh: refreshCertificates } = await useAsyncData('my-learning-certificates', () => fetchCertificates().catch(() => []), { server: false })

const certificateNumbers = computed(() => new Map(certificates.value?.map(c => [c.courseSlug, c.certificateNumber])))

function retry() {
  refresh()
  refreshDashboard()
  refreshCertificates()
}

const stats = computed(() => {
  const d = dashboard.value
  if (!d) return []
  return [
    { label: d.streak.longestDays > d.streak.currentDays ? `Day streak · best ${d.streak.longestDays}` : 'Day streak', value: d.streak.currentDays, icon: Flame, tone: 'bg-orange-500/15 text-orange-400 light:text-orange-600' },
    { label: 'Lessons completed', value: d.lessonsCompleted, icon: ListChecks, tone: 'bg-violet-500/15 text-violet-300 light:text-violet-600' },
    { label: 'Time learned', value: formatMinutes(d.minutesLearned), icon: Clock, tone: 'bg-sky-500/15 text-sky-300 light:text-sky-600' },
    { label: 'Certificates', value: d.certificatesEarned, icon: Award, tone: 'bg-emerald-500/15 text-emerald-400 light:text-emerald-600' }
  ]
})

const weekSummary = computed(() => {
  const total = dashboard.value?.lastSevenDays.reduce((sum, day) => sum + day.lessonsCompleted, 0) ?? 0
  return `${total} lesson${total === 1 ? '' : 's'} completed in the last seven days`
})

function barHeight(lessons: number) {
  const max = Math.max(1, ...(dashboard.value?.lastSevenDays.map(day => day.lessonsCompleted) ?? []))
  return lessons ? Math.max(6, Math.round((lessons / max) * 40)) : 4
}

function dayLabel(date: string, weekday: 'narrow' | 'long') {
  // Dates are calendar days (yyyy-mm-dd); format at noon UTC so no time zone shifts the weekday
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday, timeZone: 'UTC' })
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

function learnLink(item: MyCourse) {
  return item.nextLesson
    ? { path: `/learn/${item.slug}`, query: { lesson: String(item.nextLesson.lessonId) } }
    : `/learn/${item.slug}`
}

const courses = computed<MyCourse[]>(() => data.value ?? [])
const activeTab = ref<'all' | 'in-progress' | 'completed'>('all')

const tabs = computed(() => [
  { value: 'all' as const, label: 'All', count: courses.value.length },
  { value: 'in-progress' as const, label: 'In progress', count: courses.value.filter(c => !c.progress.completed).length },
  { value: 'completed' as const, label: 'Completed', count: courses.value.filter(c => c.progress.completed).length }
])

const visibleCourses = computed(() => {
  if (activeTab.value === 'completed') return courses.value.filter(c => c.progress.completed)
  if (activeTab.value === 'in-progress') return courses.value.filter(c => !c.progress.completed)
  return courses.value
})

function lastActivityLabel(item: MyCourse) {
  const value = item.lastActivityAt || item.enrolledAt
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  const prefix = item.lastActivityAt ? 'Active' : 'Enrolled'
  return `${prefix} ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}
</script>
