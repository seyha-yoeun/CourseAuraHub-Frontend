<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">{{ title || 'Recent Enrollments' }}</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Real-time student transactions and course acquisitions</p>
      </div>
      <NuxtLink to="/students" class="flex items-center gap-1 text-xs font-semibold text-violet-300 no-underline transition-colors hover:text-violet-200 light:text-violet-700 light:hover:text-violet-800">
        <span>View Students</span>
        <ArrowUpRight :size="14" />
      </NuxtLink>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr>
            <th class="border-b border-white/8 px-3.5 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Student</th>
            <th class="border-b border-white/8 px-3.5 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Course</th>
            <th class="hidden border-b border-white/8 px-3.5 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase md:table-cell light:border-slate-200 light:text-slate-500">Country</th>
            <th class="border-b border-white/8 px-3.5 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Amount</th>
            <th class="hidden border-b border-white/8 px-3.5 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase lg:table-cell light:border-slate-200 light:text-slate-500">Enrolled Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!enrollments || enrollments.length === 0">
            <td colspan="5" class="px-3.5 py-8 text-center text-white/35 light:text-slate-400">
              No recent enrollments recorded yet.
            </td>
          </tr>
          <tr
            v-for="item in enrollments"
            :key="item.id"
            class="transition-colors hover:bg-white/3 light:hover:bg-slate-50"
          >
            <!-- Student -->
            <td class="border-b border-white/4 px-3.5 py-3.5 text-white/80 light:border-slate-100 light:text-slate-700">
              <div class="flex items-center gap-2.5">
                <img :src="item.studentAvatar" :alt="item.studentName" class="size-7.5 shrink-0 rounded-full border border-violet-500/30 bg-violet-500/20" >
                <span class="font-semibold text-slate-50 light:text-slate-900">{{ item.studentName }}</span>
              </div>
            </td>

            <!-- Course Link -->
            <td class="border-b border-white/4 px-3.5 py-3.5 text-white/80 light:border-slate-100 light:text-slate-700">
              <NuxtLink :to="`/courses/${item.courseSlug}`" class="inline-block max-w-60 truncate font-medium text-blue-300 no-underline transition-colors hover:text-blue-400 hover:underline light:text-blue-600 light:hover:text-blue-700">
                {{ item.courseTitle }}
              </NuxtLink>
            </td>

            <!-- Country -->
            <td class="hidden border-b border-white/4 px-3.5 py-3.5 text-white/80 md:table-cell light:border-slate-100 light:text-slate-700">
              <span class="rounded-md border border-white/8 bg-white/5 px-2 py-0.75 text-[11px] text-white/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600">{{ item.studentCountry }}</span>
            </td>

            <!-- Amount -->
            <td class="border-b border-white/4 px-3.5 py-3.5 light:border-slate-100">
              <span class="font-bold text-emerald-400 light:text-emerald-700">+${{ item.amount.toFixed(2) }}</span>
            </td>

            <!-- Date -->
            <td class="hidden border-b border-white/4 px-3.5 py-3.5 text-xs text-white/45 lg:table-cell light:border-slate-100 light:text-slate-500">
              <span class="text-xs text-white/45 light:text-slate-500">{{ item.enrolledAt }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { RecentEnrollmentItem } from '~/types'

defineProps<{
  title?: string
  enrollments: RecentEnrollmentItem[]
}>()
</script>
