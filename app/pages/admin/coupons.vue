<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Coupons') }}</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Create discount codes that learners enter at checkout.') }}</p>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-500/40 bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
        @click="openCreate"
      >
        <Plus :size="16" />
        <span>{{ t('New Coupon') }}</span>
      </button>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="40" class="text-rose-400" />
      <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">{{ getErrorMessage(error, t('Unable to load coupons')) }}</p>
    </div>

    <div v-else-if="!coupons.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-brand-500/30 bg-brand-500/12">
        <TicketPercent :size="30" class="text-brand-300 light:text-brand-700" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">{{ t('No coupons yet') }}</h3>
      <p class="mt-1.5 max-w-90 text-[13px] text-white/45 light:text-slate-500">{{ t('Create a code to share with learners.') }}</p>
    </div>

    <DataTableFrame v-else :label="t('Coupons')" :scroll-key="tableScrollKey">
      <table class="w-full min-w-200 border-collapse text-left text-[13px]">
        <thead>
          <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
            <th class="px-4 py-3 font-semibold">{{ t('Code') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Discount') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Course') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Uses') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Expires') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Status') }}</th>
            <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="coupon in tableItems" :key="coupon.id" class="transition-colors hover:bg-white/3 light:hover:bg-slate-50">
            <td class="px-4 py-3 font-mono font-semibold text-slate-100 light:text-slate-900">{{ coupon.code }}</td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ formatDiscount(coupon) }}</td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ coupon.courseSlug || t('All courses') }}</td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ coupon.paidRedemptions }}{{ coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : '' }}</td>
            <td class="px-4 py-3 text-xs text-white/55 light:text-slate-500">{{ coupon.expiresAt ? formatDateTime(coupon.expiresAt) : t('Never') }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold"
                :class="coupon.active
                  ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
                  : 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'"
              >
                {{ coupon.active ? t('Active') : t('Inactive') }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  class="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
                  :disabled="busyId === coupon.id"
                  @click="toggleActive(coupon)"
                >
                  {{ coupon.active ? t('Deactivate') : t('Activate') }}
                </button>
                <button
                  type="button"
                  class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-all hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
                  :title="t('Edit coupon')"
                  :aria-label="`Edit coupon ${coupon.code}`"
                  @click="openEdit(coupon)"
                >
                  <Edit3 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <template #footer>
        <TablePagination v-model:page="tablePage" v-model:page-size="tablePageSize" :total="tableTotal" />
      </template>
    </DataTableFrame>

    <CouponFormModal
      :is-open="isFormOpen"
      :coupon="editing"
      :courses="courses"
      :loading="saving"
      @close="isFormOpen = false"
      @create="handleCreate"
      @update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { useClientPagination } from '~/composables/useClientPagination'
import { AlertCircle, Edit3, Plus, TicketPercent } from 'lucide-vue-next'
import type { Coupon, CouponCreate, CouponUpdate, Course } from '~/types'
import CouponFormModal from '~/components/orders/CouponFormModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useCoupons } from '~/composables/useCoupons'
import { formatDiscount } from '~/composables/useDiscounts'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Coupons') })

const toast = useAppToast()
const { fetchCoupons, createCoupon, updateCoupon } = useCoupons()

const { data, pending, error, refresh } = await useAsyncData('admin-coupons', fetchCoupons, { server: false })
const { data: courseList } = await useAsyncData('coupon-courses', () => $fetch<Course[]>('/api/courses').catch(() => []), { server: false })

const coupons = computed(() => data.value ?? [])
const { page: tablePage, pageSize: tablePageSize, total: tableTotal, items: tableItems, scrollKey: tableScrollKey } = useClientPagination(coupons)
const courses = computed(() => courseList.value ?? [])

const isFormOpen = ref(false)
const editing = ref<Coupon | null>(null)
const saving = ref(false)
const busyId = ref<number | null>(null)

function openCreate() {
  editing.value = null
  isFormOpen.value = true
}

function openEdit(coupon: Coupon) {
  editing.value = coupon
  isFormOpen.value = true
}

async function handleCreate(body: CouponCreate) {
  saving.value = true
  try {
    await createCoupon(body)
    isFormOpen.value = false
    toast.success(t('Coupon Created'), body.code.toUpperCase())
    await refresh()
  } catch (err) {
    toast.error(t('Coupon Not Created'), getErrorMessage(err, t('Unable to create coupon')))
  } finally {
    saving.value = false
  }
}

async function handleUpdate(body: CouponUpdate) {
  if (!editing.value) return
  saving.value = true
  try {
    await updateCoupon(editing.value.id, body)
    isFormOpen.value = false
    toast.success(t('Coupon Updated'), editing.value.code)
    await refresh()
  } catch (err) {
    toast.error(t('Coupon Not Updated'), getErrorMessage(err, t('Unable to update coupon')))
  } finally {
    saving.value = false
  }
}

async function toggleActive(coupon: Coupon) {
  busyId.value = coupon.id
  try {
    await updateCoupon(coupon.id, { active: !coupon.active })
    await refresh()
  } catch (err) {
    toast.error(t('Coupon Not Updated'), getErrorMessage(err, t('Unable to update coupon')))
  } finally {
    busyId.value = null
  }
}
</script>
