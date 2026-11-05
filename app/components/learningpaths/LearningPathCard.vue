<template>
  <NuxtLink
    :to="`/learning-paths/${path.slug}`"
    class="group flex flex-col overflow-hidden rounded-[18px] border border-white/10 bg-white/5 no-underline transition-all hover:-translate-y-0.5 hover:border-violet-500/40 light:border-slate-200 light:bg-white"
  >
    <div class="relative aspect-video overflow-hidden bg-white/5">
      <img :src="cover" :alt="path.title" class="size-full object-cover transition-transform duration-300 group-hover:scale-105" @error="onImageError">
      <span class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-zinc-950/75 px-2 py-0.5 text-[11px] font-semibold text-white">
        <Route :size="12" /> {{ t('{count} courses', { count: path.courseCount }) }}
      </span>
    </div>
    <div class="flex flex-1 flex-col p-4">
      <h3 class="text-sm font-bold text-slate-100 light:text-slate-900">{{ path.title }}</h3>
      <p v-if="path.description" class="mt-1 line-clamp-2 text-xs text-white/50 light:text-slate-500">{{ path.description }}</p>
      <div class="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-white/50 light:text-slate-500">
        <span>{{ t('{lessons} lessons · {hours}h', { lessons: path.totalLessons, hours: Number(path.totalHours).toFixed(1) }) }}</span>
        <span class="font-bold text-slate-100 light:text-slate-900">{{ Number(path.price) > 0 ? formatMoney(path.price) : t('Free') }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Route } from 'lucide-vue-next'
import type { LearningPath } from '~/types/learningPath'
import { formatMoney } from '~/composables/useCart'

const props = defineProps<{ path: LearningPath }>()

const { t } = useT()

const fallbackThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'
// A path without its own image uses its first course's
const cover = computed(() => props.path.thumbnail || props.path.courses[0]?.thumbnail || fallbackThumb)

function onImageError(e: Event) {
  (e.target as HTMLImageElement).src = fallbackThumb
}
</script>
