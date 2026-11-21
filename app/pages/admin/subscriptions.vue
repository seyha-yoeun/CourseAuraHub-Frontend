<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 :class="pageTitle">Subscriptions</h1>
        <p :class="pageSubtitle">All-access plans and the learners on them. A new price applies from each subscriber's next renewal.</p>
      </div>
      <button v-if="tab === 'plans'" type="button" :class="primaryButton" @click="openCreate">
        <Plus :size="16" />
        New Plan
      </button>
      <div v-else class="w-full sm:w-52">
        <AppDropdown
          :model-value="status"
          :options="statusOptions"
          aria-label="Filter subscriptions by status"
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
        :class="tab === item.value ? 'bg-violet-600 text-white' : 'text-white/60 hover:text-white light:text-slate-600 light:hover:text-slate-900'"
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
      <p v-else-if="plansError" :class="emptyBox">{{ getErrorMessage(plansError, 'Unable to load subscription plans') }}</p>
      <p v-else-if="!plans.length" :class="emptyBox">No plans yet. Create one so learners can subscribe.</p>
      <div v-else :class="tableWrap">
        <table class="w-full min-w-180 border-collapse text-left text-[13px]">
          <thead>
            <tr :class="headRow">
              <th class="px-4 py-3 font-semibold">Plan</th>
              <th class="px-4 py-3 font-semibold">Code</th>
              <th class="px-4 py-3 font-semibold">Price</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="plan in plans" :key="plan.id">
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-100 light:text-slate-900">{{ plan.name }}</p>
                <p v-if="plan.description" class="mt-0.5 line-clamp-1 text-xs text-white/45 light:text-slate-500">{{ plan.description }}</p>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-white/60 light:text-slate-500">{{ plan.code }}</td>
              <td class="px-4 py-3 text-slate-100 light:text-slate-900">{{ formatMoney(plan.price, plan.currency) }} <span class="text-xs text-white/45 light:text-slate-500">{{ intervalLabel(plan.billingInterval) }}</span></td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="plan.active ? SUBSCRIPTION_STATUS_CLASSES.active : SUBSCRIPTION_STATUS_CLASSES.expired">
                  {{ plan.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1.5">
                  <button type="button" :class="neutralAction" :disabled="busyId === plan.id" @click="toggleActive(plan)">
                    {{ plan.active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button type="button" :class="primaryAction" @click="openEdit(plan)">Edit</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Subscribers -->
    <template v-else>
      <div v-if="subsPending" class="flex flex-col gap-3">
        <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
      </div>
      <p v-else-if="subsError" :class="emptyBox">{{ getErrorMessage(subsError, 'Unable to load subscriptions') }}</p>
      <p v-else-if="!subscriptions.length" :class="emptyBox">No subscriptions here.</p>
      <template v-else>
        <div :class="tableWrap">
          <table class="w-full min-w-200 border-collapse text-left text-[13px]">
            <thead>
              <tr :class="headRow">
                <th class="px-4 py-3 font-semibold">Learner</th>
                <th class="px-4 py-3 font-semibold">Plan</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold">Period ends</th>
                <th class="px-4 py-3 font-semibold">Started</th>
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
                  <p v-if="item.cancelAtPeriodEnd" class="mt-1 text-[11px] text-white/45 light:text-slate-500">Cancels at period end</p>
                </td>
                <td class="px-4 py-3 text-xs text-white/60 light:text-slate-500">{{ item.currentPeriodEnd ? formatDate(item.currentPeriodEnd) : '—' }}</td>
                <td class="px-4 py-3 text-xs text-white/60 light:text-slate-500">{{ formatDate(item.createdAt) }}</td>
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
    </template>

    <PromptModal
      :is-open="isFormOpen"
      :title="editing ? 'Edit Plan' : 'New Plan'"
      :show-input="false"
      :confirm-label="editing ? 'Save Plan' : 'Create Plan'"
      :loading="saving"
      :disabled="!form.code.trim() || !form.name.trim() || !(Number(form.price) > 0)"
      @close="isFormOpen = false"
      @confirm="save"
    >
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label :class="labelClass" for="plan-name">Name</label>
          <input id="plan-name" v-model="form.name" type="text" required maxlength="100" :class="inputClass">
        </div>
        <div>
          <label :class="labelClass" for="plan-code">Code</label>
          <input id="plan-code" v-model="form.code" type="text" required pattern="[a-z0-9-]{2,40}" placeholder="all-access-monthly" :class="inputClass">
          <p class="mt-1 text-[11px] text-white/40 light:text-slate-500">Lowercase letters, digits and dashes</p>
        </div>
        <div class="sm:col-span-2">
          <label :class="labelClass" for="plan-description">Description</label>
          <textarea id="plan-description" v-model="form.description" rows="2" maxlength="1000" :class="inputClass" />
        </div>
        <div>
          <label :class="labelClass" for="plan-price">Price</label>
          <input id="plan-price" v-model.number="form.price" type="number" min="0.01" step="0.01" required :class="inputClass">
        </div>
        <div>
          <span :class="labelClass">Billing</span>
          <AppDropdown
            :model-value="form.billingInterval"
            :options="intervalOptions"
            aria-label="Billing interval"
            @update:model-value="value => form.billingInterval = value as BillingInterval"
          />
        </div>
        <label class="flex items-center gap-2 text-[13px] text-slate-100 sm:col-span-2 light:text-slate-900">
          <input v-model="form.active" type="checkbox" class="accent-violet-500">
          Learners can subscribe to this plan
        </label>
      </div>
    </PromptModal>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { BillingInterval, SubscriptionPlan, SubscriptionPlanForm, SubscriptionStatus } from '~/types/subscription'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { formatMoney } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { SUBSCRIPTION_STATUS_CLASSES, SUBSCRIPTION_STATUS_LABELS, intervalLabel, useSubscription } from '~/composables/useSubscription'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import { emptyBox, headRow, inputClass, labelClass, neutralAction, pageSubtitle, pageTitle, pagerButton, primaryAction, primaryButton, tableWrap } from '~/utils/ui'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Subscriptions' })

const toast = useAppToast()
const { fetchAllPlans, createPlan, updatePlan, fetchSubscriptions } = useSubscription()

const tabs = [
  { value: 'plans', label: 'Plans' },
  { value: 'subscribers', label: 'Subscribers' },
] as const
const tab = ref<'plans' | 'subscribers'>('plans')

const { data: planData, pending: plansPending, error: plansError, refresh: refreshPlans } = await useAsyncData(
  'admin-subscription-plans',
  fetchAllPlans,
  { server: false },
)
const plans = computed(() => planData.value ?? [])

const status = ref<SubscriptionStatus | 'all'>('active')
const page = ref(0)
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'past_due', label: 'Payment due' },
  { value: 'pending', label: 'Waiting for payment' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Ended' },
  { value: 'all', label: 'All Subscriptions' },
]
const { data: subsData, pending: subsPending, error: subsError } = await useAsyncData(
  'admin-subscriptions',
  () => fetchSubscriptions(status.value, page.value),
  { server: false, watch: [status, page] },
)
const subscriptions = computed(() => subsData.value?.items ?? [])
const totalPages = computed(() => subsData.value?.totalPages ?? 0)

// A new filter starts again from the first page
watch(status, () => {
  page.value = 0
})

const intervalOptions = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
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
      toast.success('Plan Saved', form.name)
    } else {
      await createPlan(toBody(form))
      toast.success('Plan Created', form.name)
    }
    isFormOpen.value = false
    await refreshPlans()
  } catch (err) {
    toast.error('Plan Not Saved', getErrorMessage(err, 'Unable to save the plan'))
  } finally {
    saving.value = false
  }
}

async function toggleActive(plan: SubscriptionPlan) {
  busyId.value = plan.id
  try {
    await updatePlan(plan.id, toBody({ ...plan, active: !plan.active }))
    toast.success(plan.active ? 'Plan Deactivated' : 'Plan Activated', plan.active ? 'Current subscribers keep it; nobody new can join.' : plan.name)
    await refreshPlans()
  } catch (err) {
    toast.error('Plan Not Updated', getErrorMessage(err, 'Unable to update the plan'))
  } finally {
    busyId.value = null
  }
}
</script>
