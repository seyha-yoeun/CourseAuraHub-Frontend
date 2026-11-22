<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 :class="pageTitle">Referrals</h1>
        <p :class="pageSubtitle">Who invited whom. A referral qualifies with the friend's first paid order and is rewarded after the hold.</p>
      </div>
      <div class="w-full sm:w-52">
        <AppDropdown
          :model-value="status"
          :options="statusOptions"
          aria-label="Filter referrals by status"
          @update:model-value="value => status = value as ReferralStatus | 'all'"
        />
      </div>
    </div>

    <div v-if="pending && !data" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, 'Unable to load referrals') }}</p>
    <p v-else-if="!items.length" :class="emptyBox">No referrals here.</p>

    <template v-else>
      <DataTableFrame label="Referrals" :scroll-key="`${page}:${pageSize}`" :class="pending && 'opacity-60 transition-opacity'">
        <table class="w-full min-w-220 border-collapse text-left text-[13px]">
          <thead>
            <tr :class="headRow">
              <th class="px-4 py-3 font-semibold">Referrer</th>
              <th class="px-4 py-3 font-semibold">Friend</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold">Order</th>
              <th class="px-4 py-3 text-right font-semibold">Reward</th>
              <th class="px-4 py-3 font-semibold">Signed up</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="item in items" :key="item.id">
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-100 light:text-slate-900">{{ item.referrerName || '—' }}</p>
                <p class="text-xs text-white/45 light:text-slate-500">{{ item.referrerEmail }}</p>
              </td>
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-100 light:text-slate-900">{{ item.refereeName || '—' }}</p>
                <p class="text-xs text-white/45 light:text-slate-500">{{ item.refereeEmail }}</p>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="statusClass[item.status]">{{ REFERRAL_STATUS_LABELS[item.status] }}</span>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-white/55 light:text-slate-500">{{ item.orderNumber || '—' }}</td>
              <td class="px-4 py-3 text-right text-white/70 light:text-slate-600">{{ item.rewardAmount !== null ? formatMoney(item.rewardAmount) : '—' }}</td>
              <td class="px-4 py-3 text-xs text-white/60 light:text-slate-500">{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        <template #footer>
          <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" :disabled="pending" />
        </template>
      </DataTableFrame>
    </template>
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { DEFAULT_PAGE_SIZE } from '~/composables/useClientPagination'
import type { ReferralStatus } from '~/types/referral'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { formatMoney } from '~/composables/useCart'
import { REFERRAL_STATUS_LABELS, useReferral } from '~/composables/useReferral'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import { emptyBox, headRow, pageSubtitle, pageTitle } from '~/utils/ui'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Referrals' })

const { fetchForAdmin } = useReferral()

const status = ref<ReferralStatus | 'all'>('all')
const page = ref(0)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const statusOptions = [
  { value: 'all', label: 'All Referrals' },
  { value: 'signed_up', label: 'Signed up' },
  { value: 'qualified', label: 'Bought a course' },
  { value: 'rewarded', label: 'Reward paid' },
]

const { data, pending, error } = await useAsyncData(
  'admin-referrals',
  () => fetchForAdmin(status.value, page.value, pageSize.value),
  { server: false, watch: [status, page, pageSize] },
)
const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.totalElements ?? 0)

watch(status, () => {
  page.value = 0
})

const statusClass: Record<ReferralStatus, string> = {
  signed_up: 'border-slate-400/30 bg-slate-400/12 text-slate-300 light:border-slate-300 light:bg-slate-100 light:text-slate-600',
  qualified: 'border-amber-400/30 bg-amber-400/12 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700',
  rewarded: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700',
}
</script>
