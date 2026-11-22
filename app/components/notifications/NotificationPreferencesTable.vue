<template>
  <!--
    One row per notification type with every per-type channel side by side
    (email: right away / daily digest / off; browser: on/off), instead of two separate lists.
  -->
  <section :class="card" aria-labelledby="notif-types-title">
    <div class="border-b border-white/8 px-5 py-4 light:border-slate-200">
      <h2 id="notif-types-title" class="text-[15px] font-semibold text-slate-50 light:text-slate-900">{{ t('What you hear about') }}</h2>
      <p class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">
        {{ t('Everything always appears in your inbox. Choose what is also emailed or pushed to your browser.') }}
      </p>
    </div>

    <div v-if="pending" class="flex flex-col gap-2 p-5">
      <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded-lg bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="error" class="flex flex-wrap items-center justify-between gap-3 px-5 py-4" role="alert">
      <p class="text-[13px] text-rose-300 light:text-negative">{{ getErrorMessage(error, t('Unable to load notification preferences')) }}</p>
      <button type="button" class="cursor-pointer text-[13px] font-semibold text-brand-300 hover:underline light:text-brand-600" @click="refresh()">{{ t('Try again') }}</button>
    </div>

    <template v-else>
      <!-- Column headings (desktop) -->
      <div
        class="hidden items-center gap-4 border-b border-white/8 px-5 py-2.5 text-[12px] font-medium text-white/45 sm:grid light:border-slate-200 light:text-slate-500"
        :class="gridCols"
        aria-hidden="true"
      >
        <span>{{ t('Notification') }}</span>
        <span class="inline-flex items-center gap-1.5"><Mail :size="13" /> {{ t('Email') }}</span>
        <span v-if="pushEnabled" class="inline-flex items-center justify-end gap-1.5"><Monitor :size="13" /> {{ t('Browser') }}</span>
      </div>

      <ul class="m-0 list-none p-0">
        <li
          v-for="row in rows"
          :key="row.type"
          class="grid grid-cols-1 items-center gap-x-4 gap-y-2.5 border-b border-white/6 px-5 py-3 last:border-b-0 light:border-slate-100"
          :class="gridCols"
        >
          <span :id="`pref-${row.type}`" class="text-[13.5px] font-medium text-slate-100 light:text-slate-800">{{ t(row.label) }}</span>

          <!-- Email mode -->
          <div class="flex items-center gap-2">
            <span class="w-14 text-[12px] text-white/45 sm:hidden light:text-slate-500">{{ t('Email') }}</span>
            <div
              v-if="row.email"
              class="inline-flex rounded-lg border border-white/10 bg-white/4 p-0.5 light:border-slate-200 light:bg-slate-100"
              role="radiogroup"
              :aria-label="`${t(row.label)}: ${t('Email')}`"
            >
              <button
                v-for="mode in modes"
                :key="mode.value"
                type="button"
                role="radio"
                :aria-checked="row.email.mode === mode.value"
                class="cursor-pointer rounded-md px-2.5 py-1 text-[12px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
                :class="[
                  row.email.mode === mode.value
                    ? 'bg-white/10 text-slate-50 light:bg-white light:text-slate-900 light:shadow-sm'
                    : 'text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-800',
                  savingEmail === row.type && 'cursor-wait'
                ]"
                @click="setEmail(row.type, mode.value)"
              >
                {{ t(mode.label) }}
              </button>
            </div>
            <span v-else class="text-[12px] text-white/35 light:text-slate-400">{{ t('Not available') }}</span>
          </div>

          <!-- Browser push -->
          <div v-if="pushEnabled" class="flex items-center gap-2 sm:justify-end">
            <span class="w-14 text-[12px] text-white/45 sm:hidden light:text-slate-500">{{ t('Browser') }}</span>
            <AppSwitch
              v-if="row.push"
              :model-value="row.push.enabled"
              :label="`${t(row.label)}: ${t('Browser')}`"
              :busy="savingPush === row.type"
              @update:model-value="setPush(row.type, $event)"
            />
            <span v-else class="text-[12px] text-white/35 light:text-slate-400">—</span>
          </div>
        </li>
      </ul>

      <p v-if="pushEnabled" class="border-t border-white/8 px-5 py-3 text-[12px] text-white/40 light:border-slate-200 light:text-slate-500">
        {{ t('Browser pop-ups only reach devices where browser notifications are turned on above.') }}
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { Mail, Monitor } from 'lucide-vue-next'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import type { EmailMode, EmailPreference } from '~/types/emailPreference'
import type { PushPreference } from '~/types/push'
import { useAppToast } from '~/composables/useAppToast'
import { EMAIL_TYPE_LABELS, useEmailPreferences } from '~/composables/useEmailPreferences'
import { useWebPush } from '~/composables/useWebPush'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
const toast = useAppToast()
const { fetchEmailPreferences, saveEmailPreferences } = useEmailPreferences()
const push = useWebPush()

const card = 'overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03] light:border-slate-200 light:bg-white'

const modes: { value: EmailMode, label: string }[] = [
  { value: 'instant', label: 'Right away' },
  { value: 'digest', label: 'Daily digest' },
  { value: 'off', label: t('Off') },
]

interface Loaded {
  email: EmailPreference[]
  push: PushPreference[]
  pushEnabled: boolean
}

// Push preferences only matter when this server can send push at all.
const { data, pending, error, refresh } = await useAsyncData<Loaded>('notification-type-preferences', async () => {
  const [email, vapid] = await Promise.all([
    fetchEmailPreferences(),
    push.fetchVapidKey().catch(() => ({ enabled: false, publicKey: null })),
  ])
  const pushEnabled = vapid.enabled && Boolean(vapid.publicKey)
  const pushPrefs = pushEnabled ? await push.fetchPreferences().catch(() => []) : []
  return { email, push: pushPrefs, pushEnabled }
}, { server: false })

const pushEnabled = computed(() => Boolean(data.value?.pushEnabled))
const gridCols = computed(() => pushEnabled.value
  ? 'sm:grid-cols-[minmax(0,1fr)_auto_4.5rem]'
  : 'sm:grid-cols-[minmax(0,1fr)_auto]')

// Email preferences define the row order; push-only types are appended.
const rows = computed(() => {
  const email = data.value?.email ?? []
  const pushPrefs = data.value?.push ?? []
  const types = [...email.map(item => item.type), ...pushPrefs.map(item => item.type)]
  return [...new Set(types)].map(type => ({
    type,
    label: EMAIL_TYPE_LABELS[type] ?? type,
    email: email.find(item => item.type === type),
    push: pushPrefs.find(item => item.type === type),
  }))
})

const savingEmail = ref<string | null>(null)
const savingPush = ref<string | null>(null)

// Optimistic: the control flips at once and rolls back if the save fails.
async function setEmail(type: string, mode: EmailMode) {
  const current = data.value?.email.find(item => item.type === type)
  if (!data.value || !current || current.mode === mode || savingEmail.value === type) return
  const previous = current.mode
  current.mode = mode
  savingEmail.value = type
  try {
    data.value.email = await saveEmailPreferences([{ type, mode }])
  } catch (err) {
    current.mode = previous
    toast.error(t('Setting not saved'), getErrorMessage(err, t('Please try again.')))
  } finally {
    savingEmail.value = null
  }
}

async function setPush(type: string, enabled: boolean) {
  const current = data.value?.push.find(item => item.type === type)
  if (!data.value || !current || savingPush.value === type) return
  current.enabled = enabled
  savingPush.value = type
  try {
    data.value.push = await push.savePreferences([{ type, enabled }])
  } catch (err) {
    current.enabled = !enabled
    toast.error(t('Preference not saved'), getErrorMessage(err, t('Please try again.')))
  } finally {
    savingPush.value = null
  }
}
</script>
