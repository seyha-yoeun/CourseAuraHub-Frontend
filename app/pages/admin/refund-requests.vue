<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Refund Requests</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Learners asking for their money back. Approving refunds the order and removes access.</p>
      </div>
      <div class="w-full sm:w-52">
        <AppDropdown v-model="status" :options="statusOptions" aria-label="Filter refund requests by status" />
      </div>
    </div>

    <div v-if="pending && !data" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, 'Unable to load refund requests') }}</p>
    <p v-else-if="!items.length" :class="emptyBox">No refund requests here.</p>

    <template v-else>
      <DataTableFrame label="Refund requests" :scroll-key="`${page}:${pageSize}`" :class="pending && 'opacity-60 transition-opacity'">
        <table class="w-full min-w-220 border-collapse text-left text-[13px]">
          <thead>
            <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
              <th class="px-4 py-3 font-semibold">Order</th>
              <th class="px-4 py-3 font-semibold">Learner</th>
              <th class="px-4 py-3 font-semibold">Reason</th>
              <th class="px-4 py-3 font-semibold">Progress</th>
              <th class="px-4 py-3 font-semibold">Amount</th>
              <th class="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="item in items" :key="item.request.id" class="align-top">
              <td class="px-4 py-3">
                <NuxtLink :to="`/courses/${item.request.courseSlug}`" class="font-semibold text-brand-300 no-underline light:text-brand-700">{{ item.request.courseTitle }}</NuxtLink>
                <span class="block text-xs text-white/45 light:text-slate-500">{{ item.request.orderNumber }} · {{ formatDateTime(item.request.createdAt) }}</span>
              </td>
              <td class="px-4 py-3 text-white/70 light:text-slate-600">
                {{ item.studentName }}
                <span class="block text-xs text-white/45 light:text-slate-500">{{ item.studentEmail }}</span>
              </td>
              <td class="max-w-80 px-4 py-3 text-white/70 light:text-slate-600">
                <p class="line-clamp-3 whitespace-pre-line">{{ item.request.reason }}</p>
                <p v-if="item.request.decisionNote" class="mt-1 text-xs text-white/45 italic light:text-slate-500">Note: {{ item.request.decisionNote }}</p>
              </td>
              <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ item.request.progressPercent }}%</td>
              <td class="px-4 py-3 font-semibold text-emerald-400 light:text-emerald-700">{{ formatMoney(item.request.amount) }}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <template v-if="item.request.status === 'pending'">
                  <button type="button" :class="primaryAction" :disabled="busyId === item.request.id" @click="approving = item">Approve</button>
                  <button type="button" :class="[dangerAction, 'ml-2']" :disabled="busyId === item.request.id" @click="rejecting = item">Decline</button>
                </template>
                <span v-else class="text-xs font-semibold capitalize text-white/50 light:text-slate-500">
                  {{ item.request.autoApproved ? 'Auto-approved' : item.request.status }}
                </span>
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
      :is-open="Boolean(approving)"
      title="Approve Refund"
      :description="approving ? `${approving.request.orderNumber} · ${formatMoney(approving.request.amount)}. The learner loses access to the course.` : undefined"
      label="Note to the learner (optional)"
      confirm-label="Refund"
      :loading="busyId === approving?.request.id"
      @close="approving = null"
      @confirm="approve"
    />

    <PromptModal
      :is-open="Boolean(rejecting)"
      title="Decline Refund"
      :description="rejecting?.request.orderNumber"
      label="Tell the learner why"
      confirm-label="Decline"
      tone="danger"
      required
      :loading="busyId === rejecting?.request.id"
      @close="rejecting = null"
      @confirm="reject"
    />
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { DEFAULT_PAGE_SIZE } from '~/composables/useClientPagination'
import type { AdminRefundRequest } from '~/types/refund'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { formatMoney } from '~/composables/useCart'
import { useRefunds } from '~/composables/useRefunds'
import { getErrorMessage } from '~/utils/apiError'
import { dangerAction, emptyBox, primaryAction } from '~/utils/ui'
import { formatDateTime } from '~/utils/dateTime'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Refund Requests' })

const toast = useAppToast()
const { fetchForAdmin: fetchRefundRequests, approve: approveRefundRequest, reject: rejectRefundRequest } = useRefunds()

const status = ref('pending')
const page = ref(0)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Declined' },
  { value: 'all', label: 'All Requests' },
]

const { data, pending, error, refresh } = await useAsyncData(
  'admin-refund-requests',
  () => fetchRefundRequests(status.value, page.value, pageSize.value),
  { server: false, watch: [status, page, pageSize] },
)
const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.totalElements ?? 0)

watch(status, () => {
  page.value = 0
})

const busyId = ref<number | null>(null)
const approving = ref<AdminRefundRequest | null>(null)
const rejecting = ref<AdminRefundRequest | null>(null)

async function approve(note: string) {
  const item = approving.value
  if (!item) return
  busyId.value = item.request.id
  try {
    await approveRefundRequest(item.request.id, note)
    toast.success('Refunded', item.request.orderNumber)
    approving.value = null
    await refresh()
  } catch (err) {
    toast.error('Refund Failed', getErrorMessage(err, 'Unable to approve the refund'))
  } finally {
    busyId.value = null
  }
}

async function reject(note: string) {
  const item = rejecting.value
  if (!item) return
  busyId.value = item.request.id
  try {
    await rejectRefundRequest(item.request.id, note)
    toast.info('Refund Declined', item.request.orderNumber)
    rejecting.value = null
    await refresh()
  } catch (err) {
    toast.error('Not Declined', getErrorMessage(err, 'Unable to decline the refund'))
  } finally {
    busyId.value = null
  }
}

</script>
