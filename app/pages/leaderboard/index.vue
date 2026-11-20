<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 :class="pageTitle">{{ t('Leaderboard') }}</h1>
        <p :class="pageSubtitle">{{ t('XP: 10 per lesson, 20 per quiz passed, 100 per certificate.') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex gap-1 rounded-[10px] border border-white/10 bg-white/4 p-0.5 light:border-slate-200 light:bg-slate-100" role="tablist">
          <button
            v-for="item in scopes"
            :key="item.value"
            type="button"
            role="tab"
            :aria-selected="scope === item.value"
            class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="scope === item.value ? 'bg-violet-600 text-white' : 'text-white/60 hover:text-white light:text-slate-600'"
            @click="scope = item.value"
          >
            {{ t(item.label) }}
          </button>
        </div>
        <div class="w-56">
          <AppDropdown :model-value="course" :options="courseOptions" size="sm" :aria-label="t('Leaderboard for a course')" @update:model-value="value => course = String(value)" />
        </div>
      </div>
    </div>

    <WeeklyGoalCard @changed="refresh" />

    <div v-if="pending" class="flex flex-col gap-2">
      <div v-for="i in 5" :key="i" class="h-14 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load the leaderboard')) }}</p>
    <div v-else-if="!entries.length" :class="emptyBox">
      <Trophy :size="30" class="mx-auto mb-2 text-white/30 light:text-slate-400" />
      {{ t('No XP earned yet in this period. Complete a lesson to get on the board.') }}
    </div>

    <template v-else>
      <ol class="m-0 flex list-none flex-col gap-2 p-0">
        <li v-for="entry in entries" :key="entry.rank" :class="rowClass(entry)">
          <LeaderboardRow :entry="entry" />
        </li>
      </ol>
      <div v-if="data?.me && !entries.some(entry => entry.you)" class="flex flex-col gap-2">
        <p class="text-center text-xs text-white/40 light:text-slate-500">· · ·</p>
        <div :class="rowClass(data.me)"><LeaderboardRow :entry="data.me" /></div>
      </div>
    </template>
    <p v-if="data && !data.visible" class="text-xs text-white/45 light:text-slate-500">{{ t('You\'re hidden from leaderboards. Turn it back on in your weekly goal.') }}</p>
  </div>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import type { Course } from '~/types'
import type { LeaderboardEntry, LeaderboardScope } from '~/types/leaderboard'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import LeaderboardRow from '~/components/learning/LeaderboardRow.vue'
import WeeklyGoalCard from '~/components/learning/WeeklyGoalCard.vue'
import { useLeaderboard } from '~/composables/useLeaderboard'
import { getErrorMessage } from '~/utils/apiError'
import { emptyBox, pageSubtitle, pageTitle } from '~/utils/ui'

const { t } = useT()
useHead({ title: () => t('Leaderboard') })

const { fetchLeaderboard } = useLeaderboard()

const scopes = [
  { value: 'week' as const, label: 'This week' },
  { value: 'month' as const, label: 'This month' },
]
const scope = ref<LeaderboardScope>('week')
const ALL = 'all'
const course = ref(ALL)

const { data: courses } = await useAsyncData('leaderboard-courses', () => $fetch<Course[]>('/api/courses').catch(() => [] as Course[]), { server: false })
const courseOptions = computed(() => [
  { value: ALL, label: t('All courses') },
  ...(courses.value ?? []).map(item => ({ value: item.slug, label: item.title })),
])

const { data, pending, error, refresh } = await useAsyncData(
  'leaderboard',
  () => fetchLeaderboard(scope.value, course.value === ALL ? null : course.value),
  { server: false, watch: [scope, course] },
)
const entries = computed(() => data.value?.entries ?? [])

function rowClass(entry: LeaderboardEntry) {
  return entry.you
    ? 'rounded-[14px] border border-violet-500/45 bg-violet-500/12 px-4 py-3 light:border-violet-300 light:bg-violet-50'
    : 'rounded-[14px] border border-white/8 bg-white/4 px-4 py-3 light:border-slate-200 light:bg-white'
}
</script>
