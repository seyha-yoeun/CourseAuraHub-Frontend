<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 :class="pageTitle">Earnings</h1>
        <p :class="pageSubtitle">Your share of every sale on your courses. Sales become available after the refund hold.</p>
      </div>
      <button type="button" :class="primaryButton" :disabled="!summary?.canRequest" @click="isRequestOpen = true">
        <Wallet :size="16" />
        Request Payout
      </button>
    </div>

    <div v-if="summary" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="tile in tiles" :key="tile.label" :class="cardClass">
        <p class="text-xs text-white/45 light:text-slate-500">{{ tile.label }}</p>
        <p class="mt-1 text-xl font-extrabold" :class="tile.class">{{ formatMoney(tile.value, summary.currency) }}</p>
        <p class="mt-0.5 text-[11px] text-white/40 light:text-slate-500">{{ tile.hint }}</p>
      </div>
    </div>
    <p v-if="summary && !summary.canRequest && summary.available > 0 && summary.available < summary.minimumPayout" class="-mt-3 text-xs text-white/45 light:text-slate-500">
      Payouts start at {{ formatMoney(summary.minimumPayout, summary.currency) }}.
    </p>

    <!-- Payouts -->
    <section v-if="payouts.length" :class="cardClass">
      <h2 :class="sectionTitle">Payouts</h2>
      <ul class="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        <li v-for="payout in payouts" :key="payout.id" class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/8 bg-white/3 px-3.5 py-2.5 text-[13px] light:border-slate-200 light:bg-slate-50">
          <span class="font-bold text-slate-100 light:text-slate-900">{{ formatMoney(payout.amount, payout.currency) }}</span>
          <span class="text-xs text-white/55 light:text-slate-500">{{ payout.method }} · {{ formatDate(payout.createdAt) }}</span>
          <span class="ml-auto inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="PAYOUT_STATUS_CLASSES[payout.status]">{{ PAYOUT_STATUS_LABELS[payout.status] }}</span>
          <p v-if="payout.decisionNote" class="w-full text-xs text-white/55 light:text-slate-500">Admin note: {{ payout.decisionNote }}</p>
          <p v-if="payout.paymentReference" class="w-full text-xs text-white/55 light:text-slate-500">Reference: <span class="font-mono">{{ payout.paymentReference }}</span></p>
        </li>
      </ul>
    </section>

    <!-- Sales -->
    <section class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 :class="sectionTitle">Sales</h2>
        <div class="w-full sm:w-48">
          <AppDropdown
            :model-value="status"
            :options="statusOptions"
            size="sm"
            aria-label="Filter sales by status"
            @update:model-value="value => status = value as EarningStatus | 'all'"
          />
        </div>
      </div>

      <div v-if="pending" class="flex flex-col gap-3">
        <div v-for="i in 3" :key="i" class="h-14 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
      </div>
      <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, 'Unable to load your earnings') }}</p>
      <p v-else-if="!items.length" :class="emptyBox">No sales here yet.</p>
      <template v-else>
        <div :class="tableWrap">
          <table class="w-full min-w-200 border-collapse text-left text-[13px]">
            <thead>
              <tr :class="headRow">
                <th class="px-4 py-3 font-semibold">Course</th>
                <th class="px-4 py-3 font-semibold">Order</th>
                <th class="px-4 py-3 text-right font-semibold">Sale</th>
                <th class="px-4 py-3 text-right font-semibold">Your share</th>
                <th class="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/6 light:divide-slate-200">
              <tr v-for="item in items" :key="item.id">
                <td class="px-4 py-3">
                  <NuxtLink :to="`/instructor/courses/${item.courseSlug}`" class="font-semibold text-slate-100 no-underline hover:text-brand-300 light:text-slate-900 light:hover:text-brand-700">{{ item.courseTitle }}</NuxtLink>
                  <p class="text-xs text-white/45 light:text-slate-500">{{ formatDate(item.createdAt) }}<template v-if="item.type === 'refund'"> · Refund</template></p>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-white/55 light:text-slate-500">{{ item.orderNumber }}</td>
                <td class="px-4 py-3 text-right text-white/70 light:text-slate-600">{{ formatMoney(item.gross, item.currency) }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="font-semibold" :class="item.net < 0 ? 'text-rose-400 light:text-rose-600' : 'text-emerald-400 light:text-emerald-700'">{{ formatMoney(item.net, item.currency) }}</span>
                  <p class="text-[11px] text-white/40 light:text-slate-500">{{ item.sharePercent }}%</p>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="EARNING_STATUS_CLASSES[item.status]">{{ EARNING_STATUS_LABELS[item.status] }}</span>
                  <p v-if="item.status === 'pending' && item.availableAt" class="mt-1 text-[11px] text-white/40 light:text-slate-500">Available {{ formatDate(item.availableAt) }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-between gap-3 text-xs text-white/50 light:text-slate-500">
          <span>Page {{ page + 1 }} of {{ totalPages }}</span>
          <div class="flex items-center gap-2">
            <button type="button" :class="pagerButton" :disabled="page === 0" @click="page--">Previous</button>
            <button type="button" :class="pagerButton" :disabled="page + 1 >= totalPages" @click="page++">Next</button>
          </div>
        </div>
      </template>
    </section>

    <PromptModal
      :is-open="isRequestOpen"
      title="Request Payout"
      :description="summary ? `Claims everything available: ${formatMoney(summary.available, summary.currency)}. An admin approves it, then sends the money.` : ''"
      label="Note for the admin (optional)"
      confirm-label="Request Payout"
      :loading="requesting"
      :disabled="!form.method.trim() || !form.accountDetails.trim()"
      @close="isRequestOpen = false"
      @confirm="sendRequest"
    >
      <div class="mt-4 grid gap-3">
        <div>
          <span :class="labelClass">How to pay you</span>
          <AppDropdown :model-value="methodChoice" :options="methodOptions" aria-label="Payout method" @update:model-value="pickMethod" />
          <input v-if="methodChoice === OTHER" v-model="form.method" type="text" maxlength="40" required placeholder="Payment method" aria-label="Payment method" class="mt-2" :class="inputClass">
        </div>
        <div>
          <label :class="labelClass" for="payout-account">Account details</label>
          <textarea id="payout-account" v-model="form.accountDetails" rows="2" maxlength="500" required placeholder="Account name and number" :class="inputClass" />
        </div>
      </div>
    </PromptModal>
  </div>
</template>

<script setup lang="ts">
import { Wallet } from 'lucide-vue-next'
import type { EarningStatus, Payout } from '~/types/payout'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { formatMoney } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { EARNING_STATUS_CLASSES, EARNING_STATUS_LABELS, PAYOUT_STATUS_CLASSES, PAYOUT_STATUS_LABELS, usePayouts } from '~/composables/usePayouts'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import { cardClass, emptyBox, headRow, inputClass, labelClass, pageSubtitle, pageTitle, pagerButton, primaryButton, sectionTitle, tableWrap } from '~/utils/ui'

definePageMeta({ requiresStaff: true })
useHead({ title: 'Earnings' })

const toast = useAppToast()
const { fetchEarnings, fetchMyPayouts, requestPayout } = usePayouts()

const status = ref<EarningStatus | 'all'>('all')
const page = ref(0)
const statusOptions = [
  { value: 'all', label: 'All sales' },
  { value: 'pending', label: 'On hold' },
  { value: 'available', label: 'Available' },
  { value: 'paid', label: 'Paid out' },
  { value: 'reversed', label: 'Refunded' },
]

const { data, pending, error, refresh } = await useAsyncData(
  'instructor-earnings',
  () => fetchEarnings(status.value, page.value),
  { server: false, watch: [status, page] },
)
const summary = computed(() => data.value?.summary ?? null)
const items = computed(() => data.value?.items ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 0)

watch(status, () => {
  page.value = 0
})

const { data: payoutData, refresh: refreshPayouts } = await useAsyncData('instructor-payouts', () => fetchMyPayouts().catch(() => [] as Payout[]), { server: false })
const payouts = computed(() => payoutData.value ?? [])

const tiles = computed(() => {
  const s = summary.value
  if (!s) return []
  return [
    { label: 'Available', value: s.available, hint: 'Ready to request', class: 'text-emerald-400 light:text-emerald-700' },
    { label: 'On hold', value: s.pending, hint: 'Waiting out the refund window', class: 'text-amber-300 light:text-amber-700' },
    { label: 'In a payout', value: s.inPayout, hint: 'Requested, not yet paid', class: 'text-blue-300 light:text-blue-700' },
    { label: 'Paid out', value: s.paidOut, hint: 'Sent to you so far', class: 'text-slate-50 light:text-slate-900' },
  ]
})

const OTHER = 'other'
const methodOptions = [
  { value: 'Bank transfer', label: 'Bank transfer' },
  { value: 'ABA', label: 'ABA' },
  { value: 'Wing', label: 'Wing' },
  { value: 'PayPal', label: 'PayPal' },
  { value: OTHER, label: 'Other' },
]
const methodChoice = ref<string>('Bank transfer')
const form = reactive({ method: 'Bank transfer', accountDetails: '' })
const isRequestOpen = ref(false)
const requesting = ref(false)

function pickMethod(value: string | number) {
  methodChoice.value = String(value)
  form.method = methodChoice.value === OTHER ? '' : methodChoice.value
}

async function sendRequest(note: string) {
  requesting.value = true
  try {
    const payout = await requestPayout({ method: form.method.trim(), accountDetails: form.accountDetails.trim(), note: note || null })
    isRequestOpen.value = false
    toast.success('Payout Requested', `${formatMoney(payout.amount, payout.currency)} is waiting for an admin.`)
    await Promise.all([refresh(), refreshPayouts()])
  } catch (err) {
    toast.error('Payout Not Requested', getErrorMessage(err, 'Unable to request a payout'))
  } finally {
    requesting.value = false
  }
}
</script>
