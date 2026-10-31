<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Orders</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Review purchases and refund paid orders.</p>
      </div>
      <div class="w-full sm:w-52">
        <AppDropdown v-model="status" :options="statusOptions" aria-label="Filter orders by status" />
      </div>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="40" class="text-rose-400" />
      <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">{{ getErrorMessage(error, 'Unable to load orders') }}</p>
    </div>

    <div v-else-if="!items.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-violet-500/30 bg-violet-500/12">
        <Receipt :size="30" class="text-violet-300 light:text-violet-700" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">No orders found</h3>
    </div>

    <template v-else>
      <div class="overflow-x-auto rounded-[18px] border border-white/10 bg-white/5 backdrop-blur-md light:border-slate-200 light:bg-white">
        <table class="w-full min-w-200 border-collapse text-left text-[13px]">
          <thead>
            <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
              <th class="px-4 py-3 font-semibold">Order</th>
              <th class="px-4 py-3 font-semibold">Course</th>
              <th class="px-4 py-3 font-semibold">Student</th>
              <th class="px-4 py-3 font-semibold">Amount</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="item in items" :key="item.order.orderNumber" class="transition-colors hover:bg-white/3 light:hover:bg-slate-50">
              <td class="px-4 py-3">
                <span class="block font-semibold text-slate-100 light:text-slate-900">{{ item.order.orderNumber }}</span>
                <span class="text-xs text-white/40 light:text-slate-500">{{ formatDateTime(item.order.createdAt) }}</span>
              </td>
              <td class="px-4 py-3">
                <NuxtLink :to="`/courses/${item.order.courseSlug}`" class="text-white/70 no-underline hover:text-violet-300 light:text-slate-600 light:hover:text-violet-700">{{ item.order.courseTitle }}</NuxtLink>
              </td>
              <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ item.studentEmail }}</td>
              <td class="px-4 py-3 font-semibold text-emerald-400 light:text-emerald-700">${{ Number(item.order.amount).toFixed(2) }}</td>
              <td class="px-4 py-3"><OrderStatusBadge :status="item.order.status" /></td>
              <td class="px-4 py-3 text-right">
                <button
                  v-if="item.order.status === 'PAID' && Number(item.order.amount) > 0"
                  type="button"
                  class="cursor-pointer rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 light:border-rose-200 light:bg-rose-50 light:text-rose-600"
                  @click="pendingRefund = item"
                >
                  Refund
                </button>
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

    <ConfirmDeleteModal
      :is-open="Boolean(pendingRefund)"
      title="Refund Order"
      description="The learner gets their money back and loses access to the course. This can't be undone."
      :item-name="pendingRefund ? `${pendingRefund.order.orderNumber} · $${Number(pendingRefund.order.amount).toFixed(2)}` : undefined"
      :loading="refunding"
      @close="pendingRefund = null"
      @confirm="handleRefund"
    />
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Receipt } from 'lucide-vue-next'
import type { AdminOrder } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import OrderStatusBadge from '~/components/orders/OrderStatusBadge.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useOrders } from '~/composables/useOrders'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Orders' })

const toast = useAppToast()
const { fetchAdminOrders, refundOrder } = useOrders()

const status = ref('all')
const page = ref(0)

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' }
]

const { data, pending, error, refresh } = await useAsyncData(
  'admin-orders',
  () => fetchAdminOrders(status.value, page.value),
  { server: false, watch: [status, page] }
)

const items = computed(() => data.value?.items ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 0)

watch(status, () => {
  page.value = 0
})

const pendingRefund = ref<AdminOrder | null>(null)
const refunding = ref(false)

const pagerButton = 'cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40 light:border-slate-200 light:bg-slate-100 light:text-slate-700'

async function handleRefund() {
  if (!pendingRefund.value) return
  refunding.value = true
  try {
    await refundOrder(pendingRefund.value.order.orderNumber)
    toast.success('Order Refunded', pendingRefund.value.order.orderNumber)
    pendingRefund.value = null
    await refresh()
  } catch (err) {
    toast.error('Refund Failed', getErrorMessage(err, 'Unable to refund this order'))
  } finally {
    refunding.value = false
  }
}
</script>
