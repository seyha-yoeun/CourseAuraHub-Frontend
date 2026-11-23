<template>
  <div class="flex flex-col gap-4">
    <div class="w-full sm:w-52">
      <AppDropdown v-model="status" :options="statusOptions" :aria-label="t('Filter top-up requests by status')" />
    </div>

    <div v-if="pending && !data" class="h-40 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">{{ getErrorMessage(error, t('Unable to load top-up requests')) }}</p>
    <p v-else-if="!items.length" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">{{ t('No top-up requests found.') }}</p>

    <DataTableFrame v-else :label="t('Member card top-ups')" :scroll-key="`${page}:${pageSize}`" :class="pending && 'opacity-60 transition-opacity'">
      <table class="w-full min-w-200 border-collapse text-left text-[13px]">
        <thead>
          <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
            <th class="px-4 py-3 font-semibold">{{ t('Holder') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Amount') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Note') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Status') }}</th>
            <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="item in items" :key="item.id">
            <td class="px-4 py-3">
              <span class="block font-semibold text-[13px] text-slate-100 light:text-slate-900">{{ item.holderName }}</span>
              <span class="text-xs text-white/45 light:text-slate-500">{{ item.studentEmail }} · {{ formatDateTime(item.createdAt) }}</span>
            </td>
            <td class="px-4 py-3 font-semibold text-emerald-400 light:text-emerald-700">{{ formatMoney(item.amount, item.currency) }}</td>
            <td class="max-w-64 px-4 py-3 text-white/70 light:text-slate-600">
              <span class="block truncate">{{ item.note || '—' }}</span>
              <a v-if="item.receiptUrl" :href="item.receiptUrl" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-brand-300 light:text-brand-700">{{ item.receiptName || t('Receipt') }}</a>
            </td>
            <td class="px-4 py-3">
              <span class="text-xs font-semibold capitalize text-white/70 light:text-slate-600">{{ item.status.toLowerCase() }}</span>
              <span v-if="item.reviewNote" class="block max-w-48 truncate text-xs text-white/45 light:text-slate-500">{{ item.reviewNote }}</span>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <template v-if="item.status === 'PENDING'">
                <button type="button" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-brand-500/35 bg-brand-500/15 text-brand-300 hover:bg-brand-500/25 light:border-brand-200 light:bg-brand-50 light:text-brand-700" :disabled="busyId === item.id" @click="approve(item)">{{ t('Approve') }}</button>
                <button type="button" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 light:border-rose-200 light:bg-rose-50 light:text-rose-600 ml-2" :disabled="busyId === item.id" @click="rejecting = item">{{ t('Reject') }}</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <template #footer>
        <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" :disabled="pending" />
      </template>
    </DataTableFrame>

    <Teleport to="body">
      <div v-if="rejecting" class="fixed inset-0 z-100 flex items-center justify-center bg-[#060b09]/82 p-4 backdrop-blur-xl" @click.self="rejecting = null">
        <form class="w-full max-w-120 rounded-[20px] border border-brand-500/25 bg-[#101814] p-5 light:border-brand-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="reject-top-up-title" @submit.prevent="reject">
          <h2 id="reject-top-up-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ t('Reject {amount}', { amount: formatMoney(rejecting.amount, rejecting.currency) }) }}</h2>
          <p class="mt-1 text-xs text-white/45 light:text-slate-500">{{ t('The learner sees this reason.') }}</p>
          <textarea v-model="rejectNote" rows="3" required maxlength="500" :aria-label="t('Reason')" class="w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 mt-3" />
          <div class="mt-3 flex justify-end gap-2">
            <button type="button" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-white/10 bg-white/5 text-white/75 hover:bg-white/9 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700" @click="rejecting = null">{{ t('Cancel') }}</button>
            <button type="submit" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 light:border-rose-200 light:bg-rose-50 light:text-rose-600" :disabled="busyId === rejecting.id || !rejectNote.trim()">{{ t('Reject') }}</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { DEFAULT_PAGE_SIZE } from '~/composables/useClientPagination'
import type { MemberCardTopUp } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { formatMoney } from '~/composables/useCart'
import { useMemberCard } from '~/composables/useMemberCard'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'

const { t } = useT()

const emit = defineEmits<{ changed: [] }>()

const toast = useAppToast()
const { fetchTopUps, approveTopUp, rejectTopUp } = useMemberCard()

const statusOptions = [
  { value: '', label: t('All Statuses') },
  { value: 'PENDING', label: t('Pending') },
  { value: 'APPROVED', label: t('Approved') },
  { value: 'REJECTED', label: t('Rejected') }
]
const status = ref('')
const page = ref(0)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const busyId = ref<number | null>(null)
const rejecting = ref<MemberCardTopUp | null>(null)
const rejectNote = ref('')

const { data, pending, error, refresh } = await useAsyncData(
  'admin-top-ups',
  () => fetchTopUps(status.value, page.value, pageSize.value),
  { server: false, watch: [status, page, pageSize] }
)
const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.totalElements ?? 0)

watch(status, () => {
  page.value = 0
})

async function approve(item: MemberCardTopUp) {
  busyId.value = item.id
  try {
    await approveTopUp(item.id)
    toast.success(t('Top-Up Approved'), `${formatMoney(item.amount, item.currency)} was added to ${item.holderName}'s card.`)
    await refresh()
    emit('changed')
  } catch (err) {
    toast.error(t('Top-Up Not Approved'), getErrorMessage(err, t('Unable to approve this request')))
  } finally {
    busyId.value = null
  }
}

async function reject() {
  const item = rejecting.value
  if (!item) return

  busyId.value = item.id
  try {
    await rejectTopUp(item.id, rejectNote.value.trim())
    toast.info(t('Top-Up Rejected'), item.holderName)
    rejecting.value = null
    rejectNote.value = ''
    await refresh()
  } catch (err) {
    toast.error(t('Top-Up Not Rejected'), getErrorMessage(err, t('Unable to reject this request')))
  } finally {
    busyId.value = null
  }
}
</script>
