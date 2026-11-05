<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Learning Paths') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Courses in a recommended order, with a certificate when you finish them all.') }}</p>
    </div>

    <div v-if="pending" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-72 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" class="rounded-[18px] border border-rose-500/25 bg-rose-500/8 px-5 py-8 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
      {{ getErrorMessage(error, t('Unable to load learning paths')) }}
    </p>
    <div v-else-if="!paths?.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <Route :size="32" class="text-violet-400" />
      <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">{{ t('No learning paths yet.') }}</p>
      <NuxtLink to="/courses" class="mt-3 text-[13px] font-semibold text-violet-300 light:text-violet-700">{{ t('Browse courses') }}</NuxtLink>
    </div>
    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <LearningPathCard v-for="path in paths" :key="path.slug" :path="path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Route } from 'lucide-vue-next'
import LearningPathCard from '~/components/learningpaths/LearningPathCard.vue'
import { useLearningPaths } from '~/composables/useLearningPaths'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
useHead({ title: () => t('Learning Paths') })

const { fetchPaths } = useLearningPaths()
const { data: paths, pending, error } = await useAsyncData('learning-paths', fetchPaths, { server: false })
</script>
