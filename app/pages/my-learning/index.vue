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

    <div v-if="pending" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-80 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="rounded-[20px] border border-rose-500/25 bg-rose-500/8 px-6 py-10 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
      {{ getErrorMessage(error, 'Unable to load your courses') }}
      <button type="button" class="ml-2 cursor-pointer font-semibold underline" @click="refresh()">Try again</button>
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
            <NuxtLink
              :to="`/learn/${item.slug}`"
              class="mt-4 flex items-center justify-center gap-1.5 rounded-[10px] border border-violet-500/35 bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300 no-underline transition-all hover:bg-violet-500/30 hover:text-white light:border-violet-300 light:bg-violet-50 light:text-violet-700"
            >
              <PlayCircle :size="14" />
              {{ item.progress.completed ? 'Review course' : item.progress.completedLessons ? 'Continue' : 'Start course' }}
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, CheckCircle2, GraduationCap, PlayCircle } from 'lucide-vue-next'
import type { MyCourse } from '~/types'
import ProgressBar from '~/components/learning/ProgressBar.vue'
import { useLearning } from '~/composables/useLearning'
import { getErrorMessage } from '~/utils/apiError'

useHead({ title: 'My Learning' })

const { fetchMyCourses } = useLearning()

const { data, pending, error, refresh } = await useAsyncData('my-courses', fetchMyCourses, { server: false })

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
