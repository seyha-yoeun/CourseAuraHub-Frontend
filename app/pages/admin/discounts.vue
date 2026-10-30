<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Discounts</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Schedule sale prices that every learner sees automatically.</p>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        @click="openCreate"
      >
        <Plus :size="16" />
        <span>New Discount</span>
      </button>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="40" class="text-rose-400" />
      <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">{{ getErrorMessage(error, 'Unable to load discounts') }}</p>
    </div>

    <div v-else-if="!discounts.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-violet-500/30 bg-violet-500/12">
        <Tag :size="30" class="text-violet-300 light:text-violet-700" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">No discounts yet</h3>
      <p class="mt-1.5 max-w-90 text-[13px] text-white/45 light:text-slate-500">Create one to put a course on sale.</p>
    </div>

    <div v-else class="overflow-x-auto rounded-[18px] border border-white/10 bg-white/5 backdrop-blur-md light:border-slate-200 light:bg-white">
      <table class="w-full min-w-200 border-collapse text-left text-[13px]">
        <thead>
          <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
            <th class="px-4 py-3 font-semibold">Course</th>
            <th class="px-4 py-3 font-semibold">Discount</th>
            <th class="px-4 py-3 font-semibold">Price</th>
            <th class="px-4 py-3 font-semibold">Schedule</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="discount in discounts" :key="discount.id" class="transition-colors hover:bg-white/3 light:hover:bg-slate-50">
            <td class="px-4 py-3">
              <NuxtLink :to="`/courses/${discount.courseSlug}`" class="font-semibold text-slate-100 no-underline hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ discount.courseTitle }}</NuxtLink>
            </td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ formatDiscount(discount) }}</td>
            <td class="px-4 py-3">
              <span class="font-semibold text-emerald-400 light:text-emerald-700">${{ Number(discount.salePrice).toFixed(2) }}</span>
              <span class="ml-1.5 text-xs text-white/35 line-through light:text-slate-400">${{ Number(discount.regularPrice).toFixed(2) }}</span>
            </td>
            <td class="px-4 py-3 text-xs text-white/55 light:text-slate-500">
              {{ formatDateTime(discount.startsAt) }}<br>
              {{ discount.endsAt ? `to ${formatDateTime(discount.endsAt)}` : 'No end date' }}
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="statusOf(discount).class">{{ statusOf(discount).label }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1.5">
                <button
                  v-if="discount.running"
                  type="button"
                  class="cursor-pointer rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-50 light:border-amber-200 light:bg-amber-50 light:text-amber-700"
                  :disabled="busyId === discount.id"
                  @click="endSale(discount)"
                >
                  End sale
                </button>
                <button type="button" :class="iconButton" title="Edit discount" :aria-label="`Edit discount for ${discount.courseTitle}`" @click="openEdit(discount)">
                  <Edit3 :size="15" />
                </button>
                <button type="button" :class="iconButton" title="Delete discount" :aria-label="`Delete discount for ${discount.courseTitle}`" @click="pendingDelete = discount">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DiscountFormModal
      :is-open="isFormOpen"
      :discount="editing"
      :courses="courses"
      :loading="saving"
      @close="isFormOpen = false"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <ConfirmDeleteModal
      :is-open="Boolean(pendingDelete)"
      title="Delete Discount"
      description="Learners go back to the regular price. Past orders keep what they paid."
      :item-name="pendingDelete?.courseTitle"
      :loading="deleting"
      @close="pendingDelete = null"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Edit3, Plus, Tag, Trash2 } from 'lucide-vue-next'
import type { Course, CourseDiscount, CourseDiscountCreate, CourseDiscountUpdate } from '~/types'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import DiscountFormModal from '~/components/courses/DiscountFormModal.vue'
import { formatDiscount, useDiscounts } from '~/composables/useDiscounts'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Discounts' })

const toast = useAppToast()
const { fetchDiscounts, createDiscount, updateDiscount, deleteDiscount } = useDiscounts()

const { data, pending, error, refresh } = await useAsyncData('admin-discounts', fetchDiscounts, { server: false })
const { data: courseList } = await useAsyncData('discount-courses', () => $fetch<Course[]>('/api/courses').catch(() => []), { server: false })

const discounts = computed(() => data.value ?? [])
const courses = computed(() => courseList.value ?? [])

const isFormOpen = ref(false)
const editing = ref<CourseDiscount | null>(null)
const saving = ref(false)
const busyId = ref<number | null>(null)
const pendingDelete = ref<CourseDiscount | null>(null)
const deleting = ref(false)

const iconButton = 'flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-all hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900'

function statusOf(discount: CourseDiscount) {
  if (discount.running) return { label: 'Running', class: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700' }
  if (!discount.active) return { label: 'Ended', class: 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600' }
  if (new Date(discount.startsAt) > new Date()) return { label: 'Scheduled', class: 'border-blue-400/30 bg-blue-400/12 text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-700' }
  return { label: 'Finished', class: 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600' }
}

function openCreate() {
  editing.value = null
  isFormOpen.value = true
}

function openEdit(discount: CourseDiscount) {
  editing.value = discount
  isFormOpen.value = true
}

async function handleCreate(body: CourseDiscountCreate) {
  saving.value = true
  try {
    await createDiscount(body)
    isFormOpen.value = false
    toast.success('Discount Created')
    await refresh()
  } catch (err) {
    toast.error('Discount Not Created', getErrorMessage(err, 'Unable to create discount'))
  } finally {
    saving.value = false
  }
}

async function handleUpdate(body: CourseDiscountUpdate) {
  if (!editing.value) return
  saving.value = true
  try {
    await updateDiscount(editing.value.id, body)
    isFormOpen.value = false
    toast.success('Discount Updated')
    await refresh()
  } catch (err) {
    toast.error('Discount Not Updated', getErrorMessage(err, 'Unable to update discount'))
  } finally {
    saving.value = false
  }
}

async function endSale(discount: CourseDiscount) {
  busyId.value = discount.id
  try {
    await updateDiscount(discount.id, { active: false })
    toast.success('Sale Ended', `${discount.courseTitle} is back to its regular price.`)
    await refresh()
  } catch (err) {
    toast.error('Sale Not Ended', getErrorMessage(err, 'Unable to end this sale'))
  } finally {
    busyId.value = null
  }
}

async function handleDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await deleteDiscount(pendingDelete.value.id)
    pendingDelete.value = null
    toast.success('Discount Deleted')
    await refresh()
  } catch (err) {
    toast.error('Discount Not Deleted', getErrorMessage(err, 'Unable to delete discount'))
  } finally {
    deleting.value = false
  }
}
</script>
