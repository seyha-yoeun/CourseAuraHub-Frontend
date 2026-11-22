<template>
  <DataTableFrame label="Students" :scroll-key="scrollKey">
    <template #toolbar>
      <div class="relative min-w-60 flex-1">
        <Search :size="16" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/40 light:text-slate-400" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="search"
          aria-label="Search students"
          placeholder="Search by name, email or country"
          class="h-9.5 w-full rounded-[10px] border border-white/10 bg-white/4 pr-3.5 pl-9.5 text-[13px] text-slate-100 outline-none transition-colors placeholder:text-white/35 focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/15 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-brand-500"
        >
      </div>
      <div class="w-full sm:w-48">
        <AppDropdown v-model="statusFilter" :options="statusOptions" placeholder="All statuses" size="sm" aria-label="Filter by status" />
      </div>
    </template>

    <table class="min-w-200 border-collapse text-left text-[13px]">
      <thead>
        <tr>
          <th class="px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500">Student</th>
          <th class="hidden px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500 md:table-cell">Country</th>
          <th class="hidden px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500 sm:table-cell">Enrolled</th>
          <th class="hidden px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500 lg:table-cell">Completed</th>
          <th class="px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500 text-right">Total spent</th>
          <th class="px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500">Status</th>
          <th class="hidden px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500 xl:table-cell">Joined</th>
          <th class="hidden px-4 py-2.5 text-[12px] font-medium whitespace-nowrap text-white/45 light:text-slate-500 lg:table-cell">Last active</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!filteredStudents.length">
          <td colspan="8" class="px-4 py-14 text-center text-[13px] text-white/45 light:text-slate-500">
            No students match your search.
          </td>
        </tr>
        <tr
          v-for="student in items"
          :key="student.id"
          class="transition-colors hover:bg-white/[0.03] light:hover:bg-slate-50"
        >
          <td class="border-b border-white/6 px-4 py-3 light:border-slate-100">
            <div class="flex items-center gap-3">
              <img :src="student.avatar" :alt="''" class="size-8 shrink-0 rounded-full bg-brand-500/15 ring-1 ring-white/10 light:bg-brand-50 light:ring-slate-200">
              <div class="flex min-w-0 flex-col">
                <button type="button" class="cursor-pointer truncate text-left font-semibold text-slate-50 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-900 light:hover:text-brand-600" @click="$emit('select', student.id)">{{ student.name }}</button>
                <span class="truncate text-[12px] text-white/45 light:text-slate-500">{{ student.email }}</span>
              </div>
            </div>
          </td>
          <td class="hidden border-b border-white/6 px-4 py-3 light:border-slate-100 text-white/70 md:table-cell light:text-slate-600">{{ student.country }}</td>
          <td class="hidden border-b border-white/6 px-4 py-3 light:border-slate-100 text-white/75 tabular-nums sm:table-cell light:text-slate-700">
            {{ student.enrolledCourses?.length ?? 0 }} {{ (student.enrolledCourses?.length ?? 0) === 1 ? 'course' : 'courses' }}
          </td>
          <td class="hidden border-b border-white/6 px-4 py-3 light:border-slate-100 text-white/75 tabular-nums lg:table-cell light:text-slate-700">
            {{ student.completedCourses?.length ?? 0 }}
          </td>
          <td class="border-b border-white/6 px-4 py-3 light:border-slate-100 text-right font-semibold whitespace-nowrap text-slate-50 tabular-nums light:text-slate-900">
            ${{ student.totalSpent.toFixed(2) }}
          </td>
          <td class="border-b border-white/6 px-4 py-3 light:border-slate-100">
            <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium capitalize" :class="statusClass(student.status)">
              <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {{ student.status }}
            </span>
          </td>
          <td class="hidden border-b border-white/6 px-4 py-3 light:border-slate-100 text-[12.5px] whitespace-nowrap text-white/50 tabular-nums xl:table-cell light:text-slate-500">{{ student.joinedAt }}</td>
          <td class="hidden border-b border-white/6 px-4 py-3 light:border-slate-100 text-[12.5px] whitespace-nowrap text-white/50 tabular-nums lg:table-cell light:text-slate-500">{{ student.lastActive }}</td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
    </template>
  </DataTableFrame>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { Student } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { useClientPagination } from '~/composables/useClientPagination'

const props = defineProps<{
  students: Student[]
}>()

defineEmits<{
  (e: 'select', id: number): void
}>()

const searchQuery = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const filteredStudents = computed(() => {
  let list = props.students || []

  if (statusFilter.value !== 'all') {
    list = list.filter(s => s.status === statusFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    )
  }

  return list
})

const { page, pageSize, total, items, scrollKey } = useClientPagination(filteredStudents, {
  resetOn: [searchQuery, statusFilter],
})

function statusClass(status: string) {
  if (status === 'active') return 'bg-emerald-400/12 text-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  return 'bg-white/8 text-white/55 light:bg-slate-100 light:text-slate-600'
}
</script>
