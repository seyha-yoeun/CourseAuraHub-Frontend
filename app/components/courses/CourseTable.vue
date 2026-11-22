<template>
  <DataTableFrame label="Courses" :scroll-key="scrollKey" class="relative z-10">
    <table class="w-full border-collapse text-left text-[13px]">
      <thead>
        <tr>
          <th class="border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Course</th>
          <th class="hidden border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase lg:table-cell light:border-slate-200 light:text-slate-500">Category</th>
          <th class="hidden border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase xl:table-cell light:border-slate-200 light:text-slate-500">Level</th>
          <th class="border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Status</th>
          <th class="hidden border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase sm:table-cell light:border-slate-200 light:text-slate-500">Price</th>
          <th class="hidden border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase md:table-cell light:border-slate-200 light:text-slate-500">Students</th>
          <th class="hidden border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase md:table-cell light:border-slate-200 light:text-slate-500">Revenue</th>
          <th class="hidden border-b border-white/8 px-3.5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase lg:table-cell light:border-slate-200 light:text-slate-500">Rating</th>
          <th class="border-b border-white/8 px-3.5 py-3 text-right text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="course in items"
          :key="course.id"
          class="transition-colors hover:bg-white/3 light:hover:bg-slate-50"
        >
          <!-- Course -->
          <td class="min-w-60 border-b border-white/4 px-3.5 py-3 light:border-slate-100">
            <div class="flex items-center gap-3">
              <img
                :src="course.thumbnail || fallbackThumb"
                :alt="course.title"
                class="aspect-video w-16 shrink-0 rounded-lg border border-white/8 object-cover light:border-slate-200"
                loading="lazy"
                @error="onImageError"
              >
              <div class="flex min-w-0 flex-col">
                <NuxtLink :to="`/courses/${course.slug}`" class="line-clamp-1 font-semibold text-slate-50 no-underline transition-colors hover:text-brand-300 light:text-slate-900 light:hover:text-brand-700">{{ course.title }}</NuxtLink>
                <span class="text-[11px] text-white/40 light:text-slate-500">by {{ course.instructor }}</span>
              </div>
            </div>
          </td>

          <!-- Category -->
          <td class="hidden border-b border-white/4 px-3.5 py-3 lg:table-cell light:border-slate-100">
            <span class="rounded-md border border-white/8 bg-white/5 px-2 py-0.75 text-[11px] whitespace-nowrap text-white/70 light:border-slate-200 light:bg-slate-100 light:text-slate-600">{{ course.category }}</span>
          </td>

          <!-- Level -->
          <td class="hidden border-b border-white/4 px-3.5 py-3 text-xs text-white/70 xl:table-cell light:border-slate-100 light:text-slate-600">{{ course.level }}</td>

          <!-- Status -->
          <td class="border-b border-white/4 px-3.5 py-3 light:border-slate-100">
            <CourseStatusBadge :status="course.status" />
          </td>

          <!-- Price -->
          <td class="hidden border-b border-white/4 px-3.5 py-3 sm:table-cell light:border-slate-100">
            <div class="flex items-baseline gap-1.5 whitespace-nowrap">
              <span v-if="course.price <= 0" class="font-bold text-emerald-400 light:text-emerald-700">Free</span>
              <span v-else class="font-bold text-slate-50 light:text-slate-900">${{ course.price.toFixed(2) }}</span>
              <span v-if="course.price > 0 && course.originalPrice > course.price" class="text-[11px] text-white/35 line-through light:text-slate-400">${{ course.originalPrice.toFixed(2) }}</span>
            </div>
            <span v-if="course.sale" class="mt-1 inline-block rounded-md border border-rose-400/30 bg-rose-400/12 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600">
              {{ formatDiscount(course.sale) }}
            </span>
          </td>

          <!-- Students -->
          <td class="hidden border-b border-white/4 px-3.5 py-3 md:table-cell light:border-slate-100">
            <span class="inline-flex items-center gap-1.25 text-xs font-medium text-white/75 light:text-slate-700">
              <Users :size="13" class="text-brand-400" />
              {{ course.totalStudents.toLocaleString() }}
            </span>
          </td>

          <!-- Revenue -->
          <td class="hidden border-b border-white/4 px-3.5 py-3 md:table-cell light:border-slate-100">
            <span class="font-bold whitespace-nowrap text-emerald-400 light:text-emerald-700">${{ course.revenue.toLocaleString() }}</span>
          </td>

          <!-- Rating -->
          <td class="hidden border-b border-white/4 px-3.5 py-3 lg:table-cell light:border-slate-100">
            <span v-if="course.rating > 0" class="inline-flex items-center gap-1 text-xs font-bold text-amber-400 light:text-amber-600">
              <Star :size="13" class="fill-amber-400 text-amber-400" />
              {{ course.rating.toFixed(1) }}
            </span>
            <span v-else class="text-xs text-white/40 light:text-slate-400">New</span>
          </td>

          <!-- Actions -->
          <td class="border-b border-white/4 px-3.5 py-3 light:border-slate-100">
            <div class="flex items-center justify-end gap-1.5">
              <NuxtLink
                :to="`/courses/${course.slug}`"
                class="flex size-8 items-center justify-center rounded-lg border border-brand-500/35 bg-brand-500/15 text-brand-300 transition-all hover:border-brand-500/60 hover:bg-brand-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:border-brand-300 light:bg-brand-50 light:text-brand-700 light:hover:bg-brand-100 light:hover:text-brand-900"
                title="View Details & Analytics"
                :aria-label="`View details for ${course.title}`"
              >
                <ArrowRight :size="15" />
              </NuxtLink>
              <button
                type="button"
                class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-all hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
                title="Edit Course"
                :aria-label="`Edit ${course.title}`"
                @click="$emit('edit', course)"
              >
                <Edit3 :size="15" />
              </button>
              <button
                type="button"
                class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-slate-200 light:bg-slate-100 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700"
                title="Delete Course"
                :aria-label="`Delete ${course.title}`"
                @click="$emit('delete', course)"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <template #footer>
      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
    </template>
  </DataTableFrame>
</template>

<script setup lang="ts">
import { Star, Users, Edit3, Trash2, ArrowRight } from 'lucide-vue-next'
import type { Course } from '~/types'
import CourseStatusBadge from './CourseStatusBadge.vue'
import { formatDiscount } from '~/composables/useDiscounts'
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { useClientPagination } from '~/composables/useClientPagination'

const props = defineProps<{
  courses: Course[]
  /** Search/filter state from the page; when it changes the table returns to page 1 */
  resetKey?: string
}>()

const { page, pageSize, total, items, scrollKey } = useClientPagination(toRef(props, 'courses'), {
  resetOn: [() => props.resetKey],
})

defineEmits(['edit', 'delete'])

const fallbackThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'

function onImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = fallbackThumb
}
</script>
