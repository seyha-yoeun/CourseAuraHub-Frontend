<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 :class="pageTitle">{{ t('Subscriptions') }}</h1>
        <p :class="pageSubtitle">{{ t('All-access plans and the learners on them. A new price applies from each subscriber\'s next renewal.') }}</p>
      </div>
      <button v-if="tab === 'plans'" type="button" :class="primaryButton" @click="openCreate">
        <Plus :size="16" />
        {{ t('New Plan') }}
      </button>
      <div v-else class="w-full sm:w-52">
        <AppDropdown
          :model-value="status"
          :options="statusOptions"
          :aria-label="t('Filter subscriptions by status')"
          @update:model-value="value => status = value as SubscriptionStatus | 'all'"
        />
      </div>
    </div>

    <div class="flex gap-1 border-b border-white/8 pb-3 light:border-slate-200" role="tablist">
      <button
        v-for="item in tabs"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="tab === item.value"
        class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
        :class="tab === item.value ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white light:text-slate-600 light:hover:text-slate-900'"
        @click="tab = item.value"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- Plans -->
    <template v-if="tab === 'plans'">
      <div v-if="plansPending" class="flex flex-col gap-3">
        <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
      </div>
      <p v-else-if="plansError" :class="emptyBox">{{ getErrorMessage(plansError, t('Unable to load subscription plans')) }}</p>
      <p v-else-if="!plans.length" :class="emptyBox">{{ t('No plans yet. Create one so learners can subscribe.') }}</p>
      <DataTableFrame v-else :label="t('Subscription plans')" :scroll-key="planScrollKey">
        <table class="w-full min-w-180 border-collapse text-left text-[13px]">
          <thead>
            <tr :class="headRow">
              <th class="px-4 py-3 font-semibold">{{ t('Plan') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Code') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Price') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Status') }}</th>
              <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="plan in pagedPlans" :key="plan.id">
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-100 light:text-slate-900">{{ plan.name }}</p>
                <p v-if="plan.description" class="mt-0.5 line-clamp-1 text-xs text-white/45 light:text-slate-500">{{ plan.description }}</p>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-white/60 light:text-slate-500">{{ plan.code }}</td>
              <td class="px-4 py-3 text-slate-100 light:text-slate-900">{{ formatMoney(plan.price, plan.currency) }} <span class="text-xs text-white/45 light:text-slate-500">{{ intervalLabel(plan.billingInterval) }}</span></td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="plan.active ? SUBSCRIPTION_STATUS_CLASSES.active : SUBSCRIPTION_STATUS_CLASSES.expired">
                  {{ plan.active ? t('Active') : t('Inactive') }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1.5">
                  <button type="button" :class="neutralAction" :disabled="busyId === plan.id" @click="toggleActive(plan)">
                    {{ plan.active ? t('Deactivate') : t('Activate') }}
                  </button>
                  <button type="button" :class="primaryAction" @click="openEdit(plan)">{{ t('Edit') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <template #footer>
          <TablePagination v-model:page="planPage" v-model:page-size="planPageSize" :total="planTotal" />
        </template>
      </DataTableFrame>
    </template>

    <!-- Subscribers -->
    <template v-else>
      <div v-if="subsPending && !subsData" class="flex flex-col gap-3">
        <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
      </div>
      <p v-else-if="subsError" :class="emptyBox">{{ getErrorMessage(subsError, t('Unable to load subscriptions')) }}</p>
      <p v-else-if="!subscriptions.length" :class="emptyBox">{{ t('No subscriptions here.') }}</p>
      <template v-else>
        <DataTableFrame :label="t('Subscriptions')" :scroll-key="`${page}:${pageSize}`" :class="subsPending && 'opacity-60 transition-opacity'">
          <table class="w-full min-w-200 border-collapse text-left text-[13px]">
            <thead>
              <tr :class="headRow">
                <th class="px-4 py-3 font-semibold">{{ t('Learner') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('Plan') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('Status') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('Period ends') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('Started') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/6 light:divide-slate-200">
              <tr v-for="item in subscriptions" :key="item.id">
                <td class="px-4 py-3">
                  <p class="font-semibold text-slate-100 light:text-slate-900">{{ item.learnerName }}</p>
                  <p class="text-xs text-white/45 light:text-slate-500">{{ item.learnerEmail }}</p>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-white/60 light:text-slate-500">{{ item.planCode }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="SUBSCRIPTION_STATUS_CLASSES[item.status]">
                    {{ SUBSCRIPTION_STATUS_LABELS[item.status] }}
                  </span>
                  <p v-if="item.cancelAtPeriodEnd" class="mt-1 text-[11px] text-white/45 light:text-slate-500">{{ t('Cancels at period end') }}</p>
                </td>
                <td class="px-4 py-3 text-xs text-white/60 light:text-slate-500">{{ item.currentPeriodEnd ? formatDate(item.currentPeriodEnd) : '—' }}</td>
                <td class="px-4 py-3 text-xs text-white/60 light:text-slate-500">{{ formatDate(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <template #footer>
            <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" :disabled="subsPending" />
          </template>
        </DataTableFrame>
      </template>
    </template>

    <PromptModal
      :is-open="isFormOpen"
      :title="editing ? t('Edit Plan') : t('New Plan')"
      :show-input="false"
      :confirm-label="editing ? t('Save Plan') : t('Create Plan')"
      :loading="saving"
      :disabled="!form.code.trim() || !form.name.trim() || !(Number(form.price) > 0)"
      @close="isFormOpen = false"
      @confirm="save"
    >
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label :class="labelClass" for="plan-name">{{ t('Name') }}</label>
          <input id="plan-name" v-model="form.name" type="text" required maxlength="100" :class="inputClass">
        </div>
        <div>
          <label :class="labelClass" for="plan-code">{{ t('Code') }}</label>
          <input id="plan-code" v-model="form.code" type="text" required pattern="[a-z0-9-]{2,40}" :placeholder="t('all-access-monthly')" :class="inputClass">
          <p class="mt-1 text-[11px] text-white/40 light:text-slate-500">{{ t('Lowercase letters, digits and dashes') }}</p>
        </div>
        <div class="sm:col-span-2">
          <label :class="labelClass" for="plan-description">{{ t('Description') }}</label>
          <textarea id="plan-description" v-model="form.description" rows="2" maxlength="1000" :class="inputClass" />
        </div>
        <div>
          <label :class="labelClass" for="plan-price">{{ t('Price') }}</label>
          <input id="plan-price" v-model.number="form.price" type="number" min="0.01" step="0.01" required :class="inputClass">
        </div>
        <div>
          <span :class="labelClass">{{ t('Billing') }}</span>
          <AppDropdown
            :model-value="form.billingInterval"
            :options="intervalOptions"
            :aria-label="t('Billing interval')"
            @update:model-value="value => form.billingInterval = value as BillingInterval"
          />
        </div>
        <label class="flex items-center gap-2 text-[13px] text-slate-100 sm:col-span-2 light:text-slate-900">
          <input v-model="form.active" type="checkbox" class="accent-brand-500">
          {{ t('Learners can subscribe to this plan') }}
        </label>
      </div>
    </PromptModal>
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { DEFAULT_PAGE_SIZE, useClientPagination } from '~/composables/useClientPagination'
import { Plus } from 'lucide-vue-next'
import type { BillingInterval, SubscriptionPlan, SubscriptionPlanForm, SubscriptionStatus } from '~/types/subscription'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { formatMoney } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { SUBSCRIPTION_STATUS_CLASSES, SUBSCRIPTION_STATUS_LABELS, intervalLabel, useSubscription } from '~/composables/useSubscription'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import { emptyBox, headRow, inputClass, labelClass, neutralAction, pageSubtitle, pageTitle, primaryAction, primaryButton } from '~/utils/ui'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Subscriptions') })

const toast = useAppToast()
const { fetchAllPlans, createPlan, updatePlan, fetchSubscriptions } = useSubscription()

const tabs = [
  { value: 'plans', label: t('Plans') },
  { value: 'subscribers', label: t('Subscribers') },
] as const
const tab = ref<'plans' | 'subscribers'>('plans')

const { data: planData, pending: plansPending, error: plansError, refresh: refreshPlans } = await useAsyncData(
  'admin-subscription-plans',
  fetchAllPlans,
  { server: false },
)
const plans = computed(() => planData.value ?? [])
const { page: planPage, pageSize: planPageSize, total: planTotal, items: pagedPlans, scrollKey: planScrollKey } = useClientPagination(plans)

const status = ref<SubscriptionStatus | 'all'>('active')
const page = ref(0)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const statusOptions = [
  { value: 'active', label: t('Active') },
  { value: 'past_due', label: t('Payment due') },
  { value: 'pending', label: t('Waiting for payment') },
  { value: 'cancelled', label: t('Cancelled') },
  { value: 'expired', label: t('Ended') },
  { value: 'all', label: t('All Subscriptions') },
]
const { data: subsData, pending: subsPending, error: subsError } = await useAsyncData(
  'admin-subscriptions',
  () => fetchSubscriptions(status.value, page.value, pageSize.value),
  { server: false, watch: [status, page, pageSize] },
)
const subscriptions = computed(() => subsData.value?.items ?? [])
const total = computed(() => subsData.value?.totalElements ?? 0)

// A new filter starts again from the first page
watch(status, () => {
  page.value = 0
})

const intervalOptions = [
  { value: 'month', label: t('Monthly') },
  { value: 'year', label: t('Yearly') },
]

const isFormOpen = ref(false)
const editing = ref<SubscriptionPlan | null>(null)
const saving = ref(false)
const busyId = ref<number | null>(null)
const form = reactive<SubscriptionPlanForm>({ code: '', name: '', description: '', price: 0, billingInterval: 'month', active: true })

function openCreate() {
  editing.value = null
  Object.assign(form, { code: '', name: '', description: '', price: 0, billingInterval: 'month', active: true })
  isFormOpen.value = true
}

function openEdit(plan: SubscriptionPlan) {
  editing.value = plan
  Object.assign(form, {
    code: plan.code,
    name: plan.name,
    description: plan.description ?? '',
    price: plan.price,
    billingInterval: plan.billingInterval,
    active: plan.active,
  })
  isFormOpen.value = true
}

function toBody(source: SubscriptionPlanForm): SubscriptionPlanForm {
  return {
    code: source.code.trim(),
    name: source.name.trim(),
    description: source.description?.trim() || null,
    price: Number(source.price),
    billingInterval: source.billingInterval,
    active: source.active,
  }
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await updatePlan(editing.value.id, toBody(form))
      toast.success(t('Plan Saved'), form.name)
    } else {
      await createPlan(toBody(form))
      toast.success(t('Plan Created'), form.name)
    }
    isFormOpen.value = false
    await refreshPlans()
  } catch (err) {
    toast.error(t('Plan Not Saved'), getErrorMessage(err, t('Unable to save the plan')))
  } finally {
    saving.value = false
  }
}

async function toggleActive(plan: SubscriptionPlan) {
  busyId.value = plan.id
  try {
    await updatePlan(plan.id, toBody({ ...plan, active: !plan.active }))
    toast.success(plan.active ? t('Plan Deactivated') : t('Plan Activated'), plan.active ? t('Current subscribers keep it; nobody new can join.') : plan.name)
    await refreshPlans()
  } catch (err) {
    toast.error(t('Plan Not Updated'), getErrorMessage(err, t('Unable to update the plan')))
  } finally {
    busyId.value = null
  }
}
</script>
