<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Reported Content') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Reviews, questions and answers that learners flagged. Hiding removes the content for everyone.') }}</p>
    </div>

    <div v-if="pending && !data" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load reports')) }}</p>
    <p v-else-if="!items.length" :class="emptyBox">{{ t('Nothing is waiting for review.') }}</p>

    <template v-else>
      <ul class="m-0 flex list-none flex-col gap-3 p-0 transition-opacity" :class="pending && 'opacity-60'">
        <li v-for="report in items" :key="report.id" class="rounded-[18px] border border-white/10 bg-white/5 p-4 light:border-slate-200 light:bg-white">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full border border-brand-500/30 bg-brand-500/12 px-2 py-0.5 font-semibold capitalize text-brand-300 light:border-brand-200 light:bg-brand-50 light:text-brand-700">{{ report.targetType }}</span>
                <span v-if="report.reportsOnTarget > 1" class="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-semibold text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600">{{ t('{reportsOnTarget} reports', { reportsOnTarget: report.reportsOnTarget }) }}</span>
                <NuxtLink v-if="report.courseSlug" :to="`/courses/${report.courseSlug}`" class="text-white/50 no-underline hover:text-brand-300 light:text-slate-500">{{ report.courseSlug }}</NuxtLink>
                <span class="text-white/40 light:text-slate-400">{{ formatDateTime(report.createdAt) }}</span>
              </div>
              <blockquote class="mt-2.5 border-l-2 border-white/15 pl-3 text-[13px] whitespace-pre-line text-slate-200 light:border-slate-300 light:text-slate-800">
                {{ report.excerpt || t('No text') }}
              </blockquote>
              <p class="mt-1.5 text-xs text-white/45 light:text-slate-500">{{ t('By {author}', { author: report.author || 'unknown' }) }}</p>
              <p class="mt-2 text-xs text-white/65 light:text-slate-600"><span class="font-semibold">{{ t('Reason:') }}</span> {{ report.reason }}</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button" :class="neutralAction" :disabled="busyId === report.id" @click="dismiss(report)">{{ t('Dismiss') }}</button>
              <button type="button" :class="dangerAction" :disabled="busyId === report.id" @click="hiding = report">{{ t('Hide Content') }}</button>
            </div>
          </div>
        </li>
      </ul>

      <div class="rounded-[14px] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 sm:px-4 light:border-slate-200 light:bg-white">
        <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" :disabled="pending" />
      </div>
    </template>

    <PromptModal
      :is-open="Boolean(hiding)"
      :title="t('Hide Content')"
      :description="`This ${hiding?.targetType ?? 'post'} disappears for everyone, and every open report on it is closed.`"
      :confirm-label="t('Hide')"
      tone="danger"
      :show-input="false"
      :loading="busyId === hiding?.id"
      @close="hiding = null"
      @confirm="hide"
    />
  </div>
</template>

<script setup lang="ts">
import TablePagination from '~/components/shared/TablePagination.vue'
import { DEFAULT_PAGE_SIZE } from '~/composables/useClientPagination'
import type { ContentReport } from '~/types/moderation'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useModeration } from '~/composables/useModeration'
import { getErrorMessage } from '~/utils/apiError'
import { dangerAction, emptyBox, neutralAction } from '~/utils/ui'
import { formatDateTime } from '~/utils/dateTime'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Reported Content') })

const toast = useAppToast()
const { fetchOpenReports, hideReported, dismissReport } = useModeration()

const page = ref(0)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const { data, pending, error, refresh } = await useAsyncData(
  'admin-reports',
  () => fetchOpenReports(page.value, pageSize.value),
  { server: false, watch: [page, pageSize] },
)
const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.totalElements ?? 0)

const busyId = ref<number | null>(null)
const hiding = ref<ContentReport | null>(null)

async function hide() {
  const report = hiding.value
  if (!report) return
  busyId.value = report.id
  try {
    await hideReported(report.id)
    toast.success(t('Content Hidden'), `The ${report.targetType} is no longer visible.`)
    hiding.value = null
    await refresh()
  } catch (err) {
    toast.error(t('Not Hidden'), getErrorMessage(err, t('Unable to hide this content')))
  } finally {
    busyId.value = null
  }
}

async function dismiss(report: ContentReport) {
  busyId.value = report.id
  try {
    await dismissReport(report.id)
    toast.info(t('Report Dismissed'))
    await refresh()
  } catch (err) {
    toast.error(t('Not Dismissed'), getErrorMessage(err, t('Unable to dismiss the report')))
  } finally {
    busyId.value = null
  }
}

</script>
