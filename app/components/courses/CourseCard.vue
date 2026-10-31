<template>
  <div class="group flex h-full flex-col overflow-hidden rounded-[18px] border border-white/8 bg-zinc-950/65 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-zinc-950/80 hover:shadow-xl hover:shadow-violet-500/10 light:border-slate-200 light:bg-white light:hover:border-violet-300 light:hover:bg-white light:hover:shadow-violet-500/10">
    <!-- Thumbnail & Badges -->
    <div class="relative aspect-video w-full overflow-hidden">
      <img
        :src="course.thumbnail || fallbackThumb"
        :alt="course.title"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="onImageError"
      >
      <div class="absolute inset-0 bg-linear-to-b from-zinc-950/30 to-zinc-950/70 light:from-white/10 light:to-white/50" />

      <div class="absolute top-3 right-3 left-3 z-2 flex items-center justify-between">
        <CourseStatusBadge v-if="canManage" :status="course.status" />
        <span v-else />
        <span class="rounded-md border border-white/12 bg-black/60 px-2 py-0.75 text-[10px] font-bold tracking-wider text-slate-200 uppercase backdrop-blur-md light:border-slate-300 light:bg-white/80 light:text-slate-700">{{ course.level }}</span>
      </div>

      <div class="absolute bottom-3 right-3 left-3 z-2 flex items-center justify-between">
        <span class="rounded-md border border-violet-500/50 bg-violet-600/35 px-2 py-0.5 text-[11px] font-semibold text-violet-200 backdrop-blur-md light:border-violet-300 light:bg-violet-100 light:text-violet-700">{{ course.category }}</span>
        <span v-if="course.rating > 0" class="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-black/65 px-1.75 py-0.5 text-[11px] font-bold text-amber-400 light:border-amber-200 light:bg-white/90 light:text-amber-600">
          <Star :size="12" class="fill-amber-400 text-amber-400" />
          {{ course.rating.toFixed(1) }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-4.5 sm:p-5">
      <div class="mb-2 flex items-center justify-between gap-2 text-xs text-white/45 light:text-slate-500">
        <span>by {{ course.instructor }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <Clock :size="12" />
          {{ course.totalHours }}h ({{ course.totalLessons }} lessons)
        </span>
      </div>

      <NuxtLink :to="`/courses/${course.slug}`" class="no-underline">
        <h3 class="line-clamp-2 text-base leading-snug font-bold text-slate-100 transition-colors hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ course.title }}</h3>
      </NuxtLink>

      <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50 light:text-slate-600">{{ course.description }}</p>

      <!-- Tags -->
      <div v-if="course.tags && course.tags.length" class="mt-3 flex flex-wrap gap-1.5">
        <span v-for="tag in course.tags.slice(0, 3)" :key="tag" class="rounded border border-white/6 bg-white/4 px-1.75 py-0.5 text-[10px] font-medium text-white/50 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
          #{{ tag }}
        </span>
        <span v-if="course.tags.length > 3" class="rounded border border-white/6 bg-white/4 px-1.75 py-0.5 text-[10px] font-medium text-white/50 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
          +{{ course.tags.length - 3 }}
        </span>
      </div>

      <!-- Metrics -->
      <div class="mt-3.5 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/2 px-3.5 py-2.5 light:border-slate-200 light:bg-slate-50">
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] tracking-wider text-white/40 uppercase light:text-slate-500">{{ t('Students') }}</span>
          <span class="flex items-center gap-1 text-[13px] font-bold text-slate-100 light:text-slate-900">
            <Users :size="13" class="text-violet-400" />
            {{ course.totalStudents.toLocaleString() }}
          </span>
        </div>
        <div v-if="canManage" class="flex flex-col gap-0.5">
          <span class="text-[10px] tracking-wider text-white/40 uppercase light:text-slate-500">{{ t('Revenue') }}</span>
          <span class="flex items-center gap-1 text-[13px] font-bold text-emerald-400 light:text-emerald-700">
            ${{ formatRevenue(course.revenue) }}
          </span>
        </div>
        <div v-else class="flex flex-col gap-0.5">
          <span class="text-[10px] tracking-wider text-white/40 uppercase light:text-slate-500">{{ t('Rating') }}</span>
          <span class="flex items-center gap-1 text-[13px] font-bold text-amber-400 light:text-amber-600">
            <Star :size="13" class="fill-amber-400 text-amber-400" />
            {{ course.rating > 0 ? course.rating.toFixed(1) : t('New') }}
          </span>
        </div>
      </div>

      <!-- Footer: Pricing & Actions -->
      <div class="mt-4 flex items-center justify-between gap-3 border-t border-white/6 pt-3.5 light:border-slate-200">
        <div class="flex items-baseline gap-1.5">
          <span v-if="course.price <= 0" class="text-lg font-extrabold text-emerald-400 light:text-emerald-700">{{ t('Free') }}</span>
          <span v-else class="text-lg font-extrabold text-slate-50 light:text-slate-900">${{ course.price.toFixed(2) }}</span>
          <span v-if="course.price > 0 && course.originalPrice > course.price" class="text-xs text-white/35 line-through light:text-slate-400">
            ${{ course.originalPrice.toFixed(2) }}
          </span>
          <span v-if="course.sale" class="rounded-md border border-rose-400/30 bg-rose-400/12 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600">
            {{ formatDiscount(course.sale) }}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <template v-if="canManage">
            <button
              type="button"
              class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-all hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
              :title="t('Edit Course')"
              @click.stop="$emit('edit', course)"
            >
              <Edit3 :size="15" />
            </button>
            <button
              type="button"
              class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-slate-200 light:bg-slate-100 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700"
              :title="t('Delete Course')"
              @click.stop="$emit('delete', course)"
            >
              <Trash2 :size="15" />
            </button>
          </template>
          <NuxtLink
            :to="`/courses/${course.slug}`"
            class="flex items-center gap-1 rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 no-underline transition-all hover:border-violet-500/60 hover:bg-violet-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100 light:hover:text-violet-900"
            :title="canManage ? 'View Details & Analytics' : 'View Course'"
          >
            <span>{{ canManage ? t('Details') : t('View') }}</span>
            <ArrowRight :size="13" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Clock, Users, Edit3, Trash2, ArrowRight } from 'lucide-vue-next'
import type { Course } from '~/types'
import CourseStatusBadge from './CourseStatusBadge.vue'
import { formatDiscount } from '~/composables/useDiscounts'

const { t } = useT()

withDefaults(
  defineProps<{
    course: Course
    canManage?: boolean
  }>(),
  {
    canManage: true
  }
)

defineEmits(['edit', 'delete'])

const fallbackThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'

function onImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = fallbackThumb
}

function formatRevenue(val: number) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
  return val.toFixed(0)
}
</script>
