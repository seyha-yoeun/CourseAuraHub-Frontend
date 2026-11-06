<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Audit Log') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Every create, update and delete made by admins and instructors. Request bodies are never stored.') }}</p>
    </div>

    <!-- Filters -->
    <div class="relative z-20 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 xl:grid-cols-5 light:border-slate-200 light:bg-white">
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">{{ t('Person') }}</span>
        <input v-model="actor" type="email" :placeholder="t('Exact email')" :class="inputClass" @input="debouncedReload">
      </label>
      <div class="flex flex-col gap-1.5">
        <span :class="labelClass">{{ t('Resource') }}</span>
        <AppDropdown v-model="resource" :options="resourceOptions" :aria-label="t('Resource')" />
      </div>
      <div class="flex flex-col gap-1.5">
        <span :class="labelClass">{{ t('Outcome') }}</span>
        <AppDropdown v-model="outcome" :options="outcomeOptions" :aria-label="t('Outcome')" />
      </div>
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">{{ t('From') }}</span>
        <input v-model="fromDate" type="date" :max="toDate || undefined" :class="inputClass">
      </label>
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">{{ t('To') }}</span>
        <input v-model="toDate" type="date" :min="fromDate || undefined" :class="inputClass">
      </label>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 4" :key="i" class="h-14 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="40" class="text-rose-400" />
      <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">{{ getErrorMessage(error, t('Unable to load the audit log')) }}</p>
    </div>

    <div v-else-if="!items.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-violet-500/30 bg-violet-500/12">
        <ScrollText :size="30" class="text-violet-300 light:text-violet-700" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">{{ t('No matching actions') }}</h3>
    </div>

    <template v-else>
      <p class="text-xs text-white/45 light:text-slate-500">{{ t('{count} actions', { count: data?.totalElements ?? 0 }) }}</p>
      <div class="overflow-x-auto rounded-[18px] border border-white/10 bg-white/5 backdrop-blur-md light:border-slate-200 light:bg-white">
        <table class="w-full min-w-220 border-collapse text-left text-[13px]">
          <thead>
            <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
              <th class="px-4 py-3 font-semibold">{{ t('When') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Who') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Action') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Target') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Result') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Request') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="item in items" :key="item.id" class="align-top transition-colors hover:bg-white/3 light:hover:bg-slate-50">
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="block text-slate-100 light:text-slate-900" :title="formatDateTime(item.createdAt)">{{ formatTimeAgo(item.createdAt) }}</span>
                <span v-if="item.ipAddress" class="text-[11px] text-white/35 light:text-slate-400">{{ item.ipAddress }}</span>
              </td>
              <td class="px-4 py-3">
                <button type="button" class="block cursor-pointer text-left text-slate-100 hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700" :title="t('Show only this person')" @click="filterActor(item.actorEmail)">
                  {{ item.actorEmail }}
                </button>
                <span class="text-[11px] text-white/40 light:text-slate-500">{{ item.actorRole === 'ADMIN' ? t('Admin') : t('Instructor') }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="mr-1.5 rounded px-1.5 py-px text-[10px] font-bold" :class="methodClass(item.httpMethod)">{{ item.httpMethod }}</span>
                <span class="font-medium text-slate-100 light:text-slate-900">{{ describe(item.action) }}</span>
                <span class="mt-0.5 block font-mono text-[11px] text-white/35 light:text-slate-400">{{ item.pathPattern }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-white/70 light:text-slate-600">{{ item.resource }}</span>
                <span v-if="item.resourceId" class="block font-mono text-[11px] text-white/45 light:text-slate-500">{{ item.resourceId }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  class="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  :class="item.outcome === 'SUCCESS'
                    ? 'bg-emerald-400/15 text-emerald-400 light:bg-emerald-50 light:text-emerald-700'
                    : 'bg-rose-400/15 text-rose-400 light:bg-rose-50 light:text-rose-700'"
                >
                  {{ item.outcome === 'SUCCESS' ? t('Success') : t('Failed') }} · {{ item.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="item.requestId"
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] text-white/45 hover:text-white light:text-slate-500 light:hover:text-slate-900"
                  :title="t('Copy request id to search the logs')"
                  @click="copy(item.requestId)"
                >
                  <Copy :size="11" /> {{ item.requestId.slice(0, 8) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between gap-3 text-xs text-white/50 light:text-slate-500">
        <span>{{ t('Page {page} of {total}', { page: page + 1, total: totalPages }) }}</span>
        <div class="flex items-center gap-2">
          <button type="button" :class="pagerButton" :disabled="page === 0" @click="page--">{{ t('Previous') }}</button>
          <button type="button" :class="pagerButton" :disabled="page + 1 >= totalPages" @click="page++">{{ t('Next') }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Copy, ScrollText } from 'lucide-vue-next'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useAuditLog } from '~/composables/useAuditLog'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime, formatTimeAgo } from '~/utils/dateTime'

definePageMeta({ requiresAdmin: true })

const { t } = useT()
useHead({ title: () => t('Audit Log') })

const toast = useAppToast()
const { fetchAuditLog } = useAuditLog()

const labelClass = 'text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500'
const inputClass = 'h-10 w-full rounded-[10px] border border-white/9 bg-white/4 px-3 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/35 focus:border-violet-500/65 focus:ring-2 focus:ring-violet-500/20 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'
const pagerButton = 'cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40 light:border-slate-200 light:bg-slate-100 light:text-slate-700'

const actor = ref('')
const appliedActor = ref('')
const resource = ref('all')
const outcome = ref('all')
const fromDate = ref('')
const toDate = ref('')
const page = ref(0)

// The first path segment after /api/v1 (and /admin or /instructor) of the changed endpoint
const resourceOptions = computed(() => [
  { value: 'all', label: t('All resources') },
  ...['courses', 'course-reviews', 'categories', 'enrollments', 'students', 'users', 'orders', 'coupons', 'discounts',
    'member-cards', 'settings', 'lessons', 'submissions', 'learning-paths', 'files']
    .map(value => ({ value, label: value }))
])

const outcomeOptions = computed(() => [
  { value: 'all', label: t('Any outcome') },
  { value: 'success', label: t('Succeeded') },
  { value: 'failure', label: t('Failed') }
])

// Dates are whole local days; "to" includes the chosen day
function startOfDay(date: string, plusDays = 0) {
  if (!date) return undefined
  const day = new Date(`${date}T00:00:00`)
  day.setDate(day.getDate() + plusDays)
  return day.toISOString()
}

const { data, pending, error } = await useAsyncData(
  'admin-audit-log',
  () => fetchAuditLog({
    actor: appliedActor.value.trim() || undefined,
    resource: resource.value === 'all' ? undefined : resource.value,
    outcome: outcome.value === 'all' ? undefined : outcome.value,
    from: startOfDay(fromDate.value),
    to: startOfDay(toDate.value, 1),
    page: page.value,
    size: 50
  }),
  { server: false, watch: [appliedActor, resource, outcome, fromDate, toDate, page] }
)

const items = computed(() => data.value?.items ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 0)

watch([appliedActor, resource, outcome, fromDate, toDate], () => {
  page.value = 0
})

let actorTimer: ReturnType<typeof setTimeout> | null = null
function debouncedReload() {
  if (actorTimer) clearTimeout(actorTimer)
  actorTimer = setTimeout(() => {
    appliedActor.value = actor.value
  }, 400)
}

function filterActor(email: string) {
  actor.value = email
  appliedActor.value = email
}

// "CouponController.update" -> "Coupon · update"
function describe(action: string) {
  const [controller, method] = action.split('.')
  return `${(controller ?? '').replace(/Controller$/, '')} · ${method ?? ''}`
}

function methodClass(method: string) {
  if (method === 'DELETE') return 'bg-rose-400/15 text-rose-300 light:bg-rose-50 light:text-rose-700'
  if (method === 'POST') return 'bg-emerald-400/15 text-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  return 'bg-blue-400/15 text-blue-300 light:bg-blue-50 light:text-blue-700'
}

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(t('Copied'), value)
  } catch {
    toast.error(t('Copy failed'), value)
  }
}
</script>
