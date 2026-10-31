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
          <OrderStatusBadge :status="order.status" class="mt-2" />
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
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, BookOpen, Receipt } from 'lucide-vue-next'
import type { Order } from '~/types'
import OrderStatusBadge from '~/components/orders/OrderStatusBadge.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useOrders } from '~/composables/useOrders'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'

const { t } = useT()

useHead({ title: () => t('My Orders') })

const toast = useAppToast()
const { fetchMyOrders, cancelOrder } = useOrders()

const { data, pending, error, refresh } = await useAsyncData('my-orders', fetchMyOrders, { server: false })
const orders = computed(() => data.value ?? [])
const cancelling = ref<string | null>(null)

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
