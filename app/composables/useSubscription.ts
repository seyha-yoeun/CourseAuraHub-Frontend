import type {
  AdminSubscriptionPage,
  MySubscription,
  SubscriptionPaymentMethod,
  SubscriptionPlan,
  SubscriptionPlanForm,
  SubscriptionStatus,
} from '~/types/subscription'

/** All-access subscriptions: learners subscribe and enroll in any course; admins manage the plans. */
export function useSubscription() {
  async function fetchPlans() {
    return await $fetch<SubscriptionPlan[]>('/api/subscription-plans')
  }

  /** The learner's latest subscription, or null when they never subscribed. */
  async function fetchMine() {
    return (await $fetch<MySubscription | null>('/api/me/subscription')) ?? null
  }

  async function subscribe(planCode: string, paymentMethod: SubscriptionPaymentMethod) {
    return await $fetch<MySubscription>('/api/me/subscription', { method: 'POST', body: { planCode, paymentMethod } })
  }

  async function payOpen() {
    return await $fetch<MySubscription>('/api/me/subscription/pay', { method: 'POST' })
  }

  async function cancel() {
    return await $fetch<MySubscription>('/api/me/subscription/cancel', { method: 'POST' })
  }

  async function resume() {
    return await $fetch<MySubscription>('/api/me/subscription/resume', { method: 'POST' })
  }

  async function enrollWithSubscription(courseSlug: string) {
    return await $fetch<null>('/api/me/subscription/enrollments', { method: 'POST', body: { courseSlug } })
  }

  async function fetchAllPlans() {
    return await $fetch<SubscriptionPlan[]>('/api/admin/subscription-plans')
  }

  async function createPlan(body: SubscriptionPlanForm) {
    return await $fetch<SubscriptionPlan>('/api/admin/subscription-plans', { method: 'POST', body })
  }

  async function updatePlan(id: number, body: SubscriptionPlanForm) {
    return await $fetch<SubscriptionPlan>(`/api/admin/subscription-plans/${id}`, { method: 'PUT', body })
  }

  async function fetchSubscriptions(status: SubscriptionStatus | 'all', page: number, size = 20) {
    return await $fetch<AdminSubscriptionPage>('/api/admin/subscriptions', { query: { status, page, size } })
  }

  return {
    fetchPlans,
    fetchMine,
    subscribe,
    payOpen,
    cancel,
    resume,
    enrollWithSubscription,
    fetchAllPlans,
    createPlan,
    updatePlan,
    fetchSubscriptions,
  }
}

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending: 'Waiting for payment',
  active: 'Active',
  past_due: 'Payment due',
  cancelled: 'Cancelled',
  expired: 'Ended',
}

export const SUBSCRIPTION_STATUS_CLASSES: Record<SubscriptionStatus, string> = {
  pending: 'border-amber-400/30 bg-amber-400/12 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700',
  active: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700',
  past_due: 'border-rose-400/30 bg-rose-400/12 text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700',
  cancelled: 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600',
  expired: 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600',
}

export function intervalLabel(interval: string) {
  return interval === 'year' ? 'per year' : 'per month'
}
