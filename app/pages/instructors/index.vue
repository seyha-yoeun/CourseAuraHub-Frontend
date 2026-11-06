<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Instructors') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('The people behind our courses.') }}</p>
    </div>

    <div v-if="pending" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" class="rounded-[18px] border border-rose-500/25 bg-rose-500/8 px-5 py-8 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
      {{ getErrorMessage(error, t('Unable to load instructors')) }}
    </p>
    <p v-else-if="!instructors?.length" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">
      {{ t('No instructor profiles yet.') }}
    </p>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="item in instructors"
        :key="item.handle"
        :to="`/instructors/${item.handle}`"
        class="flex items-center gap-3.5 rounded-[18px] border border-white/10 bg-white/5 p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-violet-500/40 light:border-slate-200 light:bg-white"
      >
        <img
          :src="item.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=b6e3f4`"
          :alt="item.name"
          class="size-14 shrink-0 rounded-full border-2 border-violet-500/30 bg-white/5 object-cover"
        >
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-slate-100 light:text-slate-900">{{ item.name }}</p>
          <p v-if="item.headline" class="truncate text-xs text-white/50 light:text-slate-500">{{ item.headline }}</p>
          <p class="mt-1 text-[11px] text-white/40 light:text-slate-500">
            {{ t('{courses} courses · {students} learners', { courses: item.courses, students: item.students.toLocaleString() }) }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInstructorProfile } from '~/composables/useInstructorProfile'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
useHead({ title: () => t('Instructors') })

const { fetchInstructors } = useInstructorProfile()
const { data: instructors, pending, error } = await useAsyncData('instructors', () => fetchInstructors(), { server: false })
</script>
