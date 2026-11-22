<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 :class="pageTitle">{{ t('Payouts') }}</h1>
        <p :class="pageSubtitle">{{ t('Approve instructor payout requests, then record the transfer once the money is sent.') }}</p>
      </div>
      <div class="w-full sm:w-52">
        <AppDropdown
          :model-value="status"
          :options="statusOptions"
          :aria-label="t('Filter payouts by status')"
          @update:model-value="value => status = value as PayoutStatus | 'all'"
        />
      </div>
    </div>

    <div v-if="pending && !data" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load payout requests')) }}</p>
    <p v-else-if="!items.length" :class="emptyBox">{{ t('No payout requests here.') }}</p>

    <template v-else>
      <DataTableFrame :label="t('Payout requests')" :scroll-key="`${page}:${pageSize}`" :class="pending && 'opacity-60 transition-opacity'">
        <table class="w-full min-w-220 border-collapse text-left text-[13px]">
          <thead>
            <tr :class="headRow">
              <th class="px-4 py-3 font-semibold">{{ t('Instructor') }}</th>
              <th class="px-4 py-3 text-right font-semibold">{{ t('Amount') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Pay to') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Requested') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Status') }}</th>
              <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="item in items" :key="item.payout.id" class="align-top">
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-100 light:text-slate-900">{{ item.instructorName }}</p>
                <p class="text-xs text-white/45 light:text-slate-500">{{ item.instructorEmail }}</p>
              </td>
              <td class="px-4 py-3 text-right">
                <p class="font-bold text-slate-100 light:text-slate-900">{{ formatMoney(item.payout.amount, item.payout.currency) }}</p>
                <p class="text-[11px] text-white/40 light:text-slate-500">{{ item.earnings }} {{ item.earnings === 1 ? 'sale' : 'sales' }}</p>
              </td>
              <td class="max-w-72 px-4 py-3">
                <p class="font-semibold text-slate-100 light:text-slate-900">{{ item.payout.method }}</p>
                <p class="text-xs break-words whitespace-pre-line text-white/55 light:text-slate-500">{{ item.payout.accountDetails }}</p>
                <p v-if="item.payout.note" class="mt-1 text-xs text-white/45 italic light:text-slate-500">"{{ item.payout.note }}"</p>
              </td>
              <td class="px-4 py-3 text-xs text-white/60 light:text-slate-500">{{ formatDateTime(item.payout.createdAt) }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="PAYOUT_STATUS_CLASSES[item.payout.status]">{{ PAYOUT_STATUS_LABELS[item.payout.status] }}</span>
                <p v-if="item.payout.paymentReference" class="mt-1 font-mono text-[11px] text-white/45 light:text-slate-500">{{ item.payout.paymentReference }}</p>
                <p v-if="item.payout.decisionNote" class="mt-1 text-[11px] text-white/45 light:text-slate-500">{{ item.payout.decisionNote }}</p>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1.5">
                  <template v-if="item.payout.status === 'requested'">
                    <button type="button" :class="primaryAction" :disabled="busyId === item.payout.id" @click="open('approve', item)">{{ t('Approve') }}</button>
                    <button type="button" :class="dangerAction" :disabled="busyId === item.payout.id" @click="open('reject', item)">{{ t('Decline') }}</button>
                  </template>
                  <button v-else-if="item.payout.status === 'approved'" type="button" :class="primaryAction" :disabled="busyId === item.payout.id" @click="open('paid', item)">{{ t('Mark Paid') }}</button>
                  <span v-else class="text-xs text-white/35 light:text-slate-400">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <template #footer>
          <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" :disabled="pending" />
        </template>
      </DataTableFrame>
    </template>

    <PromptModal
      :is-open="action === 'approve'"
      :title="t('Approve Payout')"
      :description="selected ? `${formatMoney(selected.payout.amount, selected.payout.currency)} to ${selected.instructorName}. You can't approve your own.` : ''"
      :label="t('Note to the instructor (optional)')"
      :confirm-label="t('Approve')"
      :loading="busyId === selected?.payout.id"
      @close="close"
      @confirm="approve"
    />
    <PromptModal
      :is-open="action === 'reject'"
      :title="t('Decline Payout')"
      :description="t('The instructor sees this note, and the earnings can be requested again.')"
      :label="t('Reason')"
      required
      tone="danger"
      :confirm-label="t('Decline')"
      :loading="busyId === selected?.payout.id"
      @close="close"
      @confirm="reject"
    />
    <PromptModal
      :is-open="action === 'paid'"
      :title="t('Mark Payout Paid')"
      :description="selected ? `Record the transfer of ${formatMoney(selected.payout.amount, selected.payout.currency)} to ${selected.instructorName}.` : ''"
      :label="t('Note (optional)')"
      :confirm-label="t('Mark Paid')"
      :loading="busyId === selected?.payout.id"
      @close="close"
      @confirm="markPaid"
    >
      <label :class="labelClass" class="mt-4" for="payout-reference">{{ t('Transfer reference (optional)') }}</label>
      <input id="payout-reference" v-model="reference" type="text" maxlength="200" :placeholder="t('Bank or wallet transaction ID')" :class="inputClass">
    </PromptModal>
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { DEFAULT_PAGE_SIZE } from '~/composables/useClientPagination'
import type { AdminPayout, PayoutStatus } from '~/types/payout'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { formatMoney } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { PAYOUT_STATUS_CLASSES, PAYOUT_STATUS_LABELS, usePayouts } from '~/composables/usePayouts'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'
import { dangerAction, emptyBox, headRow, inputClass, labelClass, pageSubtitle, pageTitle, primaryAction } from '~/utils/ui'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Payouts') })

const toast = useAppToast()
const { fetchPayoutRequests, approvePayout, rejectPayout, markPayoutPaid } = usePayouts()

// The backend defaults to requested; 'all' is a real filter value
const status = ref<PayoutStatus | 'all'>('requested')
const page = ref(0)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const statusOptions = [
  { value: 'requested', label: t('Requested') },
  { value: 'approved', label: t('Approved, to pay') },
  { value: 'paid', label: t('Paid') },
  { value: 'rejected', label: t('Declined') },
  { value: 'all', label: t('All Payouts') },
]

const { data, pending, error, refresh } = await useAsyncData(
  'admin-payouts',
  () => fetchPayoutRequests(status.value, page.value, pageSize.value),
  { server: false, watch: [status, page, pageSize] },
)
const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.totalElements ?? 0)

watch(status, () => {
  page.value = 0
})

const action = ref<'approve' | 'reject' | 'paid' | null>(null)
const selected = ref<AdminPayout | null>(null)
const busyId = ref<number | null>(null)
const reference = ref('')

function open(next: 'approve' | 'reject' | 'paid', item: AdminPayout) {
  selected.value = item
  reference.value = ''
  action.value = next
}

function close() {
  action.value = null
}

async function run(label: string, fn: (item: AdminPayout) => Promise<unknown>, fallback: string) {
  const item = selected.value
  if (!item) return
  busyId.value = item.payout.id
  try {
    await fn(item)
    toast.success(label, `${formatMoney(item.payout.amount, item.payout.currency)} · ${item.instructorName}`)
    action.value = null
    await refresh()
  } catch (err) {
    toast.error(t('Payout Not Updated'), getErrorMessage(err, fallback))
  } finally {
    busyId.value = null
  }
}

function approve(note: string) {
  return run(t('Payout Approved'), item => approvePayout(item.payout.id, note), t('Unable to approve the payout'))
}

function reject(note: string) {
  return run(t('Payout Declined'), item => rejectPayout(item.payout.id, note), t('Unable to decline the payout'))
}

function markPaid(note: string) {
  return run(t('Payout Paid'), item => markPayoutPaid(item.payout.id, reference.value.trim(), note), t('Unable to mark the payout paid'))
}
</script>
