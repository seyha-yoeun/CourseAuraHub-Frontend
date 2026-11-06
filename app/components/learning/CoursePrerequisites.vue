<template>
  <section
    v-if="requirements?.prerequisites.length"
    class="rounded-[18px] border p-5 sm:p-6"
    :class="requirements.canEnroll
      ? 'border-white/10 bg-white/5 light:border-slate-200 light:bg-white'
      : 'border-amber-400/30 bg-amber-400/8 light:border-amber-200 light:bg-amber-50'"
  >
    <h3 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Before you start') }}</h3>
    <p v-if="!requirements.canEnroll" class="mt-1 text-xs text-amber-300 light:text-amber-800">
      {{ t('Finish the required courses below to enroll in this one.') }}
    </p>
    <p v-else class="mt-1 text-xs text-white/45 light:text-slate-500">{{ t('These courses prepare you for this one.') }}</p>

    <ul class="m-0 mt-3 flex list-none flex-col gap-2 p-0">
      <li v-for="item in requirements.prerequisites" :key="item.courseSlug" class="flex items-center gap-2.5 text-[13px]">
        <CheckCircle2 v-if="item.completed" :size="16" class="shrink-0 text-emerald-400" />
        <Circle v-else :size="16" class="shrink-0 text-white/30 light:text-slate-300" />
        <NuxtLink :to="`/courses/${item.courseSlug}`" class="min-w-0 flex-1 truncate font-semibold text-slate-100 no-underline hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">
          {{ item.courseTitle }}
        </NuxtLink>
        <span
          class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
          :class="item.hard
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600'
            : 'border-white/10 bg-white/5 text-white/55 light:border-slate-200 light:bg-slate-100 light:text-slate-500'"
        >
          {{ item.hard ? t('Required') : t('Recommended') }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { CheckCircle2, Circle } from 'lucide-vue-next'
import { usePrerequisites } from '~/composables/usePrerequisites'

/** The course's prerequisites, ticked off for the signed-in learner. Hidden when there are none. */
const props = defineProps<{ slug: string }>()

const { t } = useT()
const { fetchRequirements } = usePrerequisites()

const { data: requirements } = useAsyncData(
  () => `prerequisites-${props.slug}`,
  () => fetchRequirements(props.slug).catch(() => null),
  { server: false, watch: [() => props.slug] },
)
</script>
