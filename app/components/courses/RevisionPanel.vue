<template>
  <section v-if="pending || history.length" class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
    <h2 class="text-base font-bold text-slate-100 light:text-slate-900">Course changes</h2>
    <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">Edits to a published course go to an admin first. Learners keep seeing the current version until they are approved.</p>

    <div v-if="pending" class="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/8 p-4 light:border-amber-200 light:bg-amber-50">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span class="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300 light:border-amber-300 light:bg-amber-100 light:text-amber-800">Waiting for review</span>
          <p class="mt-1.5 text-xs text-white/50 light:text-slate-500">Last edited {{ formatDateTime(pending.updatedAt) }}</p>
        </div>
        <button type="button" :class="dangerAction" :disabled="busy" @click="withdrawing = true">Withdraw Changes</button>
      </div>

      <form class="mt-3 flex flex-col gap-2 sm:flex-row" @submit.prevent="saveSummary">
        <input
          v-model="summary"
          type="text"
          maxlength="500"
          placeholder="Summarize the changes for the reviewer and learners"
          aria-label="Change summary"
          :class="inputClass"
        >
        <button type="submit" :class="primaryAction" class="shrink-0" :disabled="busy || summary.trim() === (pending.summary ?? '')">Save Summary</button>
      </form>

      <RevisionChanges :changes="pending.changes" class="mt-3" />
    </div>

    <ul v-if="history.length" class="m-0 mt-4 flex list-none flex-col divide-y divide-white/6 p-0 light:divide-slate-200">
      <li v-for="revision in history" :key="revision.id" class="py-2.5 text-[13px]">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize" :class="statusClass(revision.status)">{{ revision.status }}</span>
          <span class="text-xs text-white/45 light:text-slate-500">{{ formatDateTime(revision.reviewedAt ?? revision.updatedAt) }}</span>
          <span class="text-xs text-white/55 light:text-slate-600">{{ revision.changes.map(change => change.field).join(', ') }}</span>
        </div>
        <p v-if="revision.summary" class="mt-1 text-white/70 light:text-slate-700">{{ revision.summary }}</p>
        <p v-if="revision.reviewNote" class="mt-1 text-xs text-amber-300 light:text-amber-800">Admin note: {{ revision.reviewNote }}</p>
      </li>
    </ul>

    <ConfirmDeleteModal
      :is-open="withdrawing"
      title="Withdraw Changes"
      description="Your pending edits are discarded and the course stays as it is now."
      :loading="busy"
      @close="withdrawing = false"
      @confirm="withdrawChanges"
    />
  </section>
</template>

<script setup lang="ts">
import type { CourseRevision, RevisionStatus } from '~/types/revision'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import RevisionChanges from '~/components/courses/RevisionChanges.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useRevisions } from '~/composables/useRevisions'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'
import { dangerAction, inputClass, primaryAction } from '~/utils/ui'

/** The pending edit to a published course, and the reviews of earlier ones. */
const props = defineProps<{ slug: string, pending: CourseRevision | null | undefined }>()
const emit = defineEmits<{ changed: [] }>()

const toast = useAppToast()
const { fetchHistory, updateSummary, withdraw } = useRevisions()

const { data: historyData, refresh: refreshHistory } = useAsyncData(
  () => `revisions-${props.slug}`,
  () => fetchHistory(props.slug).catch(() => []),
  { server: false, watch: [() => props.slug] },
)
const history = computed(() => (historyData.value ?? []).filter(revision => revision.status !== 'pending'))

const summary = ref(props.pending?.summary ?? '')
watch(() => props.pending?.summary, (value) => {
  summary.value = value ?? ''
})

const busy = ref(false)
const withdrawing = ref(false)

function statusClass(status: RevisionStatus) {
  return {
    pending: 'border-amber-400/40 bg-amber-400/12 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-800',
    approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700',
    rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600',
    withdrawn: 'border-white/10 bg-white/5 text-white/55 light:border-slate-200 light:bg-slate-100 light:text-slate-500',
  }[status]
}

async function saveSummary() {
  busy.value = true
  try {
    await updateSummary(props.slug, summary.value.trim())
    toast.success('Summary Saved')
    emit('changed')
  } catch (err) {
    toast.error('Summary Not Saved', getErrorMessage(err, 'Unable to save the change summary'))
  } finally {
    busy.value = false
  }
}

async function withdrawChanges() {
  busy.value = true
  try {
    await withdraw(props.slug)
    toast.info('Changes Withdrawn')
    withdrawing.value = false
    emit('changed')
    await refreshHistory()
  } catch (err) {
    toast.error('Not Withdrawn', getErrorMessage(err, 'Unable to withdraw the changes'))
  } finally {
    busy.value = false
  }
}
</script>
