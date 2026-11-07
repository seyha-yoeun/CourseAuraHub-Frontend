<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Reported Content</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Reviews, questions and answers that learners flagged. Hiding removes the content for everyone.</p>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, 'Unable to load reports') }}</p>
    <p v-else-if="!items.length" :class="emptyBox">Nothing is waiting for review.</p>

    <template v-else>
      <ul class="m-0 flex list-none flex-col gap-3 p-0">
        <li v-for="report in items" :key="report.id" class="rounded-[18px] border border-white/10 bg-white/5 p-4 light:border-slate-200 light:bg-white">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full border border-violet-500/30 bg-violet-500/12 px-2 py-0.5 font-semibold capitalize text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">{{ report.targetType }}</span>
                <span v-if="report.reportsOnTarget > 1" class="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-semibold text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600">{{ report.reportsOnTarget }} reports</span>
                <NuxtLink v-if="report.courseSlug" :to="`/courses/${report.courseSlug}`" class="text-white/50 no-underline hover:text-violet-300 light:text-slate-500">{{ report.courseSlug }}</NuxtLink>
                <span class="text-white/40 light:text-slate-400">{{ formatDateTime(report.createdAt) }}</span>
              </div>
              <blockquote class="mt-2.5 border-l-2 border-white/15 pl-3 text-[13px] whitespace-pre-line text-slate-200 light:border-slate-300 light:text-slate-800">
                {{ report.excerpt || 'No text' }}
              </blockquote>
              <p class="mt-1.5 text-xs text-white/45 light:text-slate-500">By {{ report.author || 'unknown' }}</p>
              <p class="mt-2 text-xs text-white/65 light:text-slate-600"><span class="font-semibold">Reason:</span> {{ report.reason }}</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button" :class="neutralAction" :disabled="busyId === report.id" @click="dismiss(report)">Dismiss</button>
              <button type="button" :class="dangerAction" :disabled="busyId === report.id" @click="hiding = report">Hide Content</button>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="totalPages > 1" class="flex items-center justify-between gap-3 text-xs text-white/50 light:text-slate-500">
        <span>Page {{ page + 1 }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button type="button" :class="pagerButton" :disabled="page === 0" @click="page--">Previous</button>
          <button type="button" :class="pagerButton" :disabled="page + 1 >= totalPages" @click="page++">Next</button>
        </div>
      </div>
    </template>

    <PromptModal
      :is-open="Boolean(hiding)"
      title="Hide Content"
      :description="`This ${hiding?.targetType ?? 'post'} disappears for everyone, and every open report on it is closed.`"
      confirm-label="Hide"
      tone="danger"
      :show-input="false"
      :loading="busyId === hiding?.id"
      @close="hiding = null"
      @confirm="hide"
    />
  </div>
</template>

<script setup lang="ts">
import type { ContentReport } from '~/types/moderation'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useModeration } from '~/composables/useModeration'
import { getErrorMessage } from '~/utils/apiError'
import { dangerAction, emptyBox, neutralAction, pagerButton } from '~/utils/ui'
import { formatDateTime } from '~/utils/dateTime'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Reported Content' })

const toast = useAppToast()
const { fetchOpenReports, hideReported, dismissReport } = useModeration()

const page = ref(0)
const { data, pending, error, refresh } = await useAsyncData(
  'admin-reports',
  () => fetchOpenReports(page.value),
  { server: false, watch: [page] },
)
const items = computed(() => data.value?.items ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 0)

const busyId = ref<number | null>(null)
const hiding = ref<ContentReport | null>(null)

async function hide() {
  const report = hiding.value
  if (!report) return
  busyId.value = report.id
  try {
    await hideReported(report.id)
    toast.success('Content Hidden', `The ${report.targetType} is no longer visible.`)
    hiding.value = null
    await refresh()
  } catch (err) {
    toast.error('Not Hidden', getErrorMessage(err, 'Unable to hide this content'))
  } finally {
    busyId.value = null
  }
}

async function dismiss(report: ContentReport) {
  busyId.value = report.id
  try {
    await dismissReport(report.id)
    toast.info('Report Dismissed')
    await refresh()
  } catch (err) {
    toast.error('Not Dismissed', getErrorMessage(err, 'Unable to dismiss the report'))
  } finally {
    busyId.value = null
  }
}

</script>
