<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 :class="pageTitle">{{ t('Subscription') }}</h1>
      <p :class="pageSubtitle">{{ t('One plan, every course. Enroll in anything while your subscription lasts.') }}</p>
    </div>

    <div v-if="pending" class="grid gap-4 md:grid-cols-2">
      <div v-for="i in 2" :key="i" class="h-48 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load your subscription')) }}</p>

    <template v-else>
      <!-- Current subscription -->
      <section v-if="current" :class="cardClass" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/12">
              <Repeat :size="20" class="text-violet-300 light:text-violet-700" />
            </div>
            <div>
              <h2 :class="sectionTitle">{{ current.plan.name }}</h2>
              <p class="text-xs text-white/50 light:text-slate-500">
                {{ formatMoney(current.plan.price, current.plan.currency) }} {{ t(intervalLabel(current.plan.billingInterval)) }}
              </p>
            </div>
          </div>
          <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="SUBSCRIPTION_STATUS_CLASSES[current.status]">
            {{ t(SUBSCRIPTION_STATUS_LABELS[current.status]) }}
          </span>
        </div>

        <dl class="grid gap-3 text-[13px] sm:grid-cols-3">
          <div>
            <dt class="text-[11px] font-semibold tracking-wider text-white/40 uppercase light:text-slate-500">{{ periodLabel }}</dt>
            <dd class="mt-0.5 font-semibold text-slate-100 light:text-slate-900">{{ current.currentPeriodEnd ? formatDate(current.currentPeriodEnd) : '—' }}</dd>
          </div>
          <div>
            <dt class="text-[11px] font-semibold tracking-wider text-white/40 uppercase light:text-slate-500">{{ t('Courses through it') }}</dt>
            <dd class="mt-0.5 font-semibold text-slate-100 light:text-slate-900">{{ current.courses }}</dd>
          </div>
          <div>
            <dt class="text-[11px] font-semibold tracking-wider text-white/40 uppercase light:text-slate-500">{{ t('Payment method') }}</dt>
            <dd class="mt-0.5 font-semibold text-slate-100 light:text-slate-900">{{ current.paymentMethod === 'member_card' ? t('Member card') : t('Pay online') }}</dd>
          </div>
        </dl>

        <p v-if="current.status === 'past_due'" class="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3.5 py-2.5 text-xs text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700" role="status">
          {{ t('Your renewal payment is due. Pay it to keep your access.') }}
        </p>
        <p v-else-if="current.status === 'pending'" class="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2.5 text-xs text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-800" role="status">
          {{ t('Your subscription starts once the first payment goes through.') }}
        </p>
        <p v-else-if="current.cancelAtPeriodEnd && current.hasAccess" class="text-xs text-white/50 light:text-slate-500">
          {{ t('Cancelled. You keep access until the end of this period.') }}
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink v-if="current.hasAccess" to="/courses" :class="primaryButton">
            <BookOpen :size="15" />
            {{ t('Browse courses') }}
          </NuxtLink>
          <button v-if="owesPayment" type="button" :class="primaryButton" :disabled="busy" @click="pay">
            <Loader2 v-if="busy" :size="15" class="animate-spin" />
            {{ t('Pay now') }}
          </button>
          <button v-if="current.cancelAtPeriodEnd && current.hasAccess" type="button" :class="neutralAction" :disabled="busy" @click="keep">
            {{ t('Keep my subscription') }}
          </button>
          <button v-else-if="canCancel" type="button" :class="dangerAction" :disabled="busy" @click="cancelling = true">
            {{ t('Cancel subscription') }}
          </button>
        </div>

        <div v-if="current.payments.length" class="border-t border-white/8 pt-4 light:border-slate-200">
          <h3 class="text-[13px] font-bold text-slate-100 light:text-slate-900">{{ t('Payments') }}</h3>
          <ul class="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
            <li v-for="payment in current.payments" :key="payment.paymentNumber" class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-xs light:border-slate-200 light:bg-slate-50">
              <span class="font-mono text-white/60 light:text-slate-500">{{ payment.paymentNumber }}</span>
              <span class="text-white/55 light:text-slate-500">
                <template v-if="payment.periodStart && payment.periodEnd">{{ formatDate(payment.periodStart) }} – {{ formatDate(payment.periodEnd) }}</template>
              </span>
              <span class="font-semibold text-slate-100 light:text-slate-900">{{ formatMoney(payment.amount, payment.currency) }}</span>
              <span :class="paymentClass[payment.status]">{{ t(paymentLabels[payment.status]) }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Plans -->
      <section v-if="showPlans" class="flex flex-col gap-3">
        <h2 v-if="current" :class="sectionTitle">{{ t('Choose a plan') }}</h2>
        <p v-if="!plans.length" :class="emptyBox">{{ t('No subscription plans are available right now.') }}</p>
        <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="plan in plans" :key="plan.id" :class="cardClass" class="flex flex-col gap-3">
            <div>
              <h3 :class="sectionTitle">{{ plan.name }}</h3>
              <p v-if="plan.description" class="mt-1 text-[13px] text-white/55 light:text-slate-600">{{ plan.description }}</p>
            </div>
            <p class="mt-auto">
              <span class="text-2xl font-extrabold text-emerald-400 light:text-emerald-700">{{ formatMoney(plan.price, plan.currency) }}</span>
              <span class="ml-1.5 text-xs text-white/45 light:text-slate-500">{{ t(intervalLabel(plan.billingInterval)) }}</span>
            </p>
            <NuxtLink v-if="!auth.isAuthenticated" :to="{ path: '/auth/login', query: { redirect: '/subscription' } }" :class="primaryButton">
              {{ t('Sign in to subscribe') }}
            </NuxtLink>
            <button v-else type="button" :class="primaryButton" @click="choosing = plan">
              {{ t('Subscribe') }}
            </button>
          </article>
        </div>
      </section>
    </template>

    <PromptModal
      :is-open="Boolean(choosing)"
      :title="t('Subscribe to {plan}', { plan: choosing?.name ?? '' })"
      :description="choosing ? `${formatMoney(choosing.price, choosing.currency)} ${t(intervalLabel(choosing.billingInterval))}` : ''"
      :show-input="false"
      :confirm-label="t('Subscribe')"
      :loading="busy"
      @close="choosing = null"
      @confirm="subscribeTo"
    >
      <fieldset class="mt-4 flex flex-col gap-2">
        <legend :class="labelClass">{{ t('Payment method') }}</legend>
        <label v-for="option in methodOptions" :key="option.value" class="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 light:border-slate-200 light:bg-slate-50 light:text-slate-900">
          <input v-model="method" type="radio" name="subscription-method" :value="option.value" class="mt-0.5 accent-violet-500">
          <span>
            <span class="font-semibold">{{ t(option.label) }}</span>
            <span class="block text-xs text-white/50 light:text-slate-500">{{ t(option.hint) }}</span>
          </span>
        </label>
      </fieldset>
    </PromptModal>

    <PromptModal
      :is-open="cancelling"
      :title="t('Cancel subscription')"
      :description="current?.status === 'pending' ? t('Your unpaid sign-up is cancelled right away.') : t('You keep access until the end of this period. Courses you joined through it close after that, but your progress is kept.')"
      :show-input="false"
      tone="danger"
      :confirm-label="t('Cancel subscription')"
      :loading="busy"
      @close="cancelling = false"
      @confirm="cancelIt"
    />
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Loader2, Repeat } from 'lucide-vue-next'
import type { MySubscription, SubscriptionPaymentMethod, SubscriptionPaymentStatus, SubscriptionPlan } from '~/types/subscription'
import PromptModal from '~/components/shared/PromptModal.vue'
import { formatMoney } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { SUBSCRIPTION_STATUS_CLASSES, SUBSCRIPTION_STATUS_LABELS, intervalLabel, useSubscription } from '~/composables/useSubscription'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import { cardClass, dangerAction, emptyBox, labelClass, neutralAction, pageSubtitle, pageTitle, primaryButton, sectionTitle } from '~/utils/ui'

const { t } = useT()
useHead({ title: () => t('Subscription') })

const auth = useAuth()
const toast = useAppToast()
const { fetchPlans, fetchMine, subscribe, payOpen, cancel, resume } = useSubscription()

const { data, pending, error, refresh } = await useAsyncData('my-subscription', async () => {
  const [plans, mine] = await Promise.all([
    fetchPlans(),
    auth.isAuthenticated ? fetchMine() : Promise.resolve(null),
  ])
  return { plans, mine }
}, { server: false })

const plans = computed(() => data.value?.plans ?? [])
const mine = ref<MySubscription | null>(null)
watch(() => data.value?.mine, (value) => {
  mine.value = value ?? null
}, { immediate: true })

// An ended or never-paid subscription is history; the learner picks a plan again
const current = computed(() => mine.value && ['active', 'past_due', 'pending'].includes(mine.value.status) ? mine.value : null)
const showPlans = computed(() => !current.value || current.value.status === 'pending')
const owesPayment = computed(() => current.value?.status === 'past_due' || current.value?.status === 'pending')
const canCancel = computed(() => Boolean(current.value) && !current.value?.cancelAtPeriodEnd)
const periodLabel = computed(() => current.value?.cancelAtPeriodEnd ? t('Access until') : t('Renews on'))

const paymentLabels: Record<SubscriptionPaymentStatus, string> = { pending: 'Waiting for payment', paid: 'Paid', failed: 'Failed', cancelled: 'Cancelled' }
const paymentClass: Record<SubscriptionPaymentStatus, string> = {
  pending: 'font-semibold text-amber-400 light:text-amber-700',
  paid: 'font-semibold text-emerald-400 light:text-emerald-700',
  failed: 'font-semibold text-rose-400 light:text-rose-600',
  cancelled: 'text-white/45 light:text-slate-500',
}

const methodOptions: { value: SubscriptionPaymentMethod, label: string, hint: string }[] = [
  { value: 'online', label: 'Pay online', hint: 'You\'ll go to the payment page to finish.' },
  { value: 'member_card', label: 'Member card', hint: 'Charged to your card balance right away.' },
]

const choosing = ref<SubscriptionPlan | null>(null)
const method = ref<SubscriptionPaymentMethod>('online')
const cancelling = ref(false)
const busy = ref(false)

// Online payments finish on the provider's page; the learner comes back here afterwards
async function followCheckout(subscription: MySubscription) {
  if (subscription.checkoutUrl && subscription.status !== 'active') {
    await navigateTo(subscription.checkoutUrl, { external: true })
    return true
  }
  return false
}

async function subscribeTo() {
  const plan = choosing.value
  if (!plan) return
  busy.value = true
  try {
    const result = await subscribe(plan.code, method.value)
    choosing.value = null
    if (await followCheckout(result)) return
    mine.value = result
    toast.success(t('Subscription active'), t('You can now enroll in any course.'))
  } catch (err) {
    toast.error(t('Subscription not started'), getErrorMessage(err, t('Please try again.')))
  } finally {
    busy.value = false
  }
}

async function pay() {
  busy.value = true
  try {
    const result = await payOpen()
    if (await followCheckout(result)) return
    mine.value = result
    toast.success(t('Payment received'), t('Your subscription is active.'))
  } catch (err) {
    toast.error(t('Payment not made'), getErrorMessage(err, t('Please try again.')))
  } finally {
    busy.value = false
  }
}

async function cancelIt() {
  busy.value = true
  try {
    mine.value = await cancel()
    cancelling.value = false
    toast.info(t('Subscription cancelled'))
    await refresh()
  } catch (err) {
    toast.error(t('Subscription not cancelled'), getErrorMessage(err, t('Please try again.')))
  } finally {
    busy.value = false
  }
}

async function keep() {
  busy.value = true
  try {
    mine.value = await resume()
    toast.success(t('Subscription resumed'), t('It renews as usual.'))
  } catch (err) {
    toast.error(t('Subscription not resumed'), getErrorMessage(err, t('Please try again.')))
  } finally {
    busy.value = false
  }
}
</script>
