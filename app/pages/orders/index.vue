<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('My Orders') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Your course purchases and their status.') }}</p>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="40" class="text-rose-400" />
      <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">{{ getErrorMessage(error, t('Unable to load your orders')) }}</p>
    </div>

    <div v-else-if="!orders.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-violet-500/30 bg-violet-500/12">
        <Receipt :size="30" class="text-violet-300 light:text-violet-700" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">{{ t('No orders yet') }}</h3>
      <p class="mt-1.5 max-w-90 text-[13px] text-white/45 light:text-slate-500">{{ t('Courses you buy will show up here.') }}</p>
      <NuxtLink to="/courses" class="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white no-underline">
        <BookOpen :size="16" /> {{ t('Browse courses') }}
      </NuxtLink>
    </div>

    <ul v-else class="m-0 flex list-none flex-col gap-3 p-0">
      <li
        v-for="order in orders"
        :key="order.orderNumber"
        class="flex flex-col gap-4 rounded-[18px] border border-white/8 bg-zinc-950/65 p-3.5 sm:flex-row sm:items-center light:border-slate-200 light:bg-white"
      >
        <NuxtLink :to="`/courses/${order.courseSlug}`" class="block aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
          <img :src="order.thumbnail" :alt="order.courseTitle" loading="lazy" class="size-full object-cover">
        </NuxtLink>

        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/courses/${order.courseSlug}`" class="no-underline">
            <h3 class="line-clamp-2 text-[15px] font-bold text-slate-100 hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ order.courseTitle }}</h3>
          </NuxtLink>
          <p class="mt-1 text-xs text-white/45 light:text-slate-500">{{ order.orderNumber }} · {{ formatDate(order.createdAt) }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <OrderStatusBadge :status="order.status" />
            <span
              v-if="refundByOrder[order.orderNumber]"
              class="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              :class="refundBadge(refundByOrder[order.orderNumber]!.status)"
            >
              {{ t(refundLabel(refundByOrder[order.orderNumber]!.status)) }}
            </span>
          </div>
          <p v-if="refundByOrder[order.orderNumber]?.decisionNote" class="mt-1.5 text-xs text-white/50 light:text-slate-500">
            {{ refundByOrder[order.orderNumber]!.decisionNote }}
          </p>
        </div>

        <div class="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span class="text-lg font-extrabold text-emerald-400 light:text-emerald-700">${{ Number(order.amount).toFixed(2) }}</span>
          <div v-if="order.status === 'PENDING'" class="flex items-center gap-2">
            <button
              type="button"
              class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:hover:text-rose-600"
              :disabled="cancelling === order.orderNumber"
              @click="cancel(order)"
            >
              {{ t('Cancel') }}
            </button>
            <a
              v-if="order.checkoutUrl"
              :href="order.checkoutUrl"
              class="rounded-[10px] border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 no-underline hover:bg-violet-500/30 hover:text-white light:border-violet-300 light:bg-violet-50 light:text-violet-700"
            >
              {{ t('Complete payment') }}
            </a>
          </div>
          <div v-else-if="order.status === 'PAID' || order.status === 'REFUNDED'" class="flex items-center gap-2">
            <button
              v-if="order.status === 'PAID' && Number(order.amount) > 0 && refundByOrder[order.orderNumber]?.status !== 'pending'"
              type="button"
              class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:hover:text-rose-600"
              :disabled="checkingRefund === order.orderNumber"
              @click="openRefund(order)"
            >
              {{ t('Request refund') }}
            </button>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/30 hover:text-white disabled:opacity-50 light:border-violet-300 light:bg-violet-50 light:text-violet-700"
              :disabled="downloading === order.orderNumber"
              @click="receipt(order)"
            >
              <Download :size="13" /> {{ t('Receipt') }}
            </button>
          </div>
        </div>
      </li>
    </ul>

    <PromptModal
      :is-open="Boolean(refunding)"
      :title="t('Request a refund')"
      :description="refunding ? refunding.order.courseTitle : undefined"
      :label="t('Why do you want a refund?')"
      :confirm-label="refunding?.eligibility.automatic ? t('Refund now') : t('Send request')"
      tone="danger"
      required
      :disabled="!refunding?.eligibility.canRequest"
      :show-input="Boolean(refunding?.eligibility.canRequest)"
      :loading="submittingRefund"
      @close="refunding = null"
      @confirm="submitRefund"
    >
      <div v-if="refunding" class="mt-3 rounded-[10px] border border-white/8 bg-white/3 px-3.5 py-2.5 text-xs leading-relaxed text-white/60 light:border-slate-200 light:bg-slate-50 light:text-slate-600">
        <template v-if="refunding.eligibility.canRequest">
          <p v-if="refunding.eligibility.automatic">{{ t('This order qualifies for an instant refund. You will lose access to the course.') }}</p>
          <p v-else>{{ t('An admin will review your request. You keep access until it is approved.') }}</p>
          <p v-if="refunding.eligibility.windowEndsAt" class="mt-1">{{ t('Refund window ends {date}.', { date: formatDate(refunding.eligibility.windowEndsAt) }) }}</p>
        </template>
        <template v-else>
          <p class="font-semibold text-rose-300 light:text-rose-600">{{ t('This order can\'t be refunded') }}</p>
          <ul class="mt-1 list-disc pl-4">
            <li v-for="reason in refunding.eligibility.reasons" :key="reason">{{ reason }}</li>
          </ul>
        </template>
      </div>
    </PromptModal>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, BookOpen, Download, Receipt } from 'lucide-vue-next'
import type { Order } from '~/types'
import type { RefundEligibility, RefundRequest, RefundRequestStatus } from '~/types/refund'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useRefunds } from '~/composables/useRefunds'
import OrderStatusBadge from '~/components/orders/OrderStatusBadge.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useOrders } from '~/composables/useOrders'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'

const { t } = useT()

useHead({ title: () => t('My Orders') })

const toast = useAppToast()
const { fetchMyOrders, cancelOrder, downloadReceipt } = useOrders()

const { data, pending, error, refresh } = await useAsyncData('my-orders', fetchMyOrders, { server: false })
const orders = computed(() => data.value ?? [])
const cancelling = ref<string | null>(null)

const { fetchEligibility, requestRefund, fetchMine: fetchMyRefundRequests } = useRefunds()
const { data: refundData, refresh: refreshRefunds } = await useAsyncData('my-refund-requests', fetchMyRefundRequests, { server: false })
// The latest request per order, so a declined one can be followed by a new request
const refundByOrder = computed(() => {
  const latest: Record<string, RefundRequest> = {}
  for (const request of refundData.value ?? []) {
    const current = latest[request.orderNumber]
    if (!current || request.createdAt > current.createdAt) latest[request.orderNumber] = request
  }
  return latest
})

const checkingRefund = ref<string | null>(null)
const refunding = ref<{ order: Order, eligibility: RefundEligibility } | null>(null)
const submittingRefund = ref(false)

function refundLabel(status: RefundRequestStatus) {
  return { pending: 'Refund requested', approved: 'Refunded', rejected: 'Refund declined' }[status]
}

function refundBadge(status: RefundRequestStatus) {
  return {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700',
    approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700',
    rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600',
  }[status]
}

async function openRefund(order: Order) {
  checkingRefund.value = order.orderNumber
  try {
    refunding.value = { order, eligibility: await fetchEligibility(order.orderNumber) }
  } catch (err) {
    toast.error(t('Refund unavailable'), getErrorMessage(err, t('Unable to check refund eligibility')))
  } finally {
    checkingRefund.value = null
  }
}

async function submitRefund(reason: string) {
  const current = refunding.value
  if (!current) return
  submittingRefund.value = true
  try {
    const result = await requestRefund(current.order.orderNumber, reason)
    if (result.status === 'approved') {
      toast.success(t('Refunded'), current.order.courseTitle)
    } else {
      toast.info(t('Refund requested'), t('An admin will review it soon.'))
    }
    refunding.value = null
    await Promise.all([refresh(), refreshRefunds()])
  } catch (err) {
    toast.error(t('Refund not requested'), getErrorMessage(err, t('Unable to request a refund')))
  } finally {
    submittingRefund.value = false
  }
}

const downloading = ref<string | null>(null)

async function receipt(order: Order) {
  downloading.value = order.orderNumber
  try {
    await downloadReceipt(order.orderNumber)
  } catch (err) {
    toast.error(t('Download failed'), getErrorMessage(err, t('Unable to download the receipt')))
  } finally {
    downloading.value = null
  }
}

async function cancel(order: Order) {
  cancelling.value = order.orderNumber
  try {
    await cancelOrder(order.orderNumber)
    toast.info(t('Order Cancelled'), order.courseTitle)
    await refresh()
  } catch (err) {
    toast.error(t('Order Not Cancelled'), getErrorMessage(err, t('Unable to cancel this order')))
  } finally {
    cancelling.value = null
  }
}
</script>
