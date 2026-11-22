<template>
  <div class="flex items-center gap-3">
    <span class="flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold" :class="medalClass">{{ entry.rank }}</span>
    <img v-if="entry.avatar" :src="entry.avatar" alt="" class="size-9 shrink-0 rounded-full bg-white/5 object-cover">
    <span v-else class="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs font-bold text-white/60 light:bg-slate-100 light:text-slate-500">{{ entry.displayName.charAt(0) }}</span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">
        {{ entry.displayName }} <span v-if="entry.you" class="text-xs font-normal text-brand-300 light:text-brand-700">({{ t('you') }})</span>
      </p>
      <p class="text-[11px] text-white/45 light:text-slate-500">{{ t('{count} lessons', { count: entry.lessonsCompleted }) }}</p>
    </div>
    <span class="shrink-0 text-sm font-extrabold text-slate-50 light:text-slate-900">{{ entry.xp.toLocaleString() }} <span class="text-[11px] font-semibold text-white/45 light:text-slate-500">XP</span></span>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardEntry } from '~/types/leaderboard'

/** One leaderboard place: rank, short name, lessons and XP. */
const props = defineProps<{ entry: LeaderboardEntry }>()

const { t } = useT()

const medalClass = computed(() => ({
  1: 'bg-amber-400/20 text-amber-300 light:bg-amber-100 light:text-amber-700',
  2: 'bg-slate-300/20 text-slate-200 light:bg-slate-200 light:text-slate-700',
  3: 'bg-orange-400/20 text-orange-300 light:bg-orange-100 light:text-orange-700',
} as Record<number, string>)[props.entry.rank] ?? 'bg-white/6 text-white/60 light:bg-slate-100 light:text-slate-500')
</script>
