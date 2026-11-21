<template>
  <section class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/12">
          <BellRing :size="20" class="text-brand-300 light:text-brand-700" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-100 light:text-slate-900">{{ t('Browser notifications') }}</h2>
          <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ t('Get a pop-up on this device, even when the site is closed.') }}</p>
        </div>
      </div>
      <button
        v-if="available"
        type="button"
        class="cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60"
        :class="subscribed
          ? 'border-white/10 bg-white/5 text-white/75 hover:bg-white/9 light:border-slate-200 light:bg-slate-100 light:text-slate-700'
          : 'border-brand-500/40 bg-brand-500 text-white hover:bg-brand-600'"
        :disabled="busy"
        @click="subscribed ? turnOff() : turnOn()"
      >
        {{ subscribed ? t('Turn off on this device') : t('Turn on') }}
      </button>
    </div>

    <div v-if="loading" class="mt-4 h-9 animate-pulse rounded-lg bg-white/5 light:bg-slate-100" />
    <p v-else-if="!supported" class="mt-3 text-xs text-white/50 light:text-slate-500">{{ t('This browser doesn\'t support notifications.') }}</p>
    <p v-else-if="!serverEnabled" class="mt-3 text-xs text-white/50 light:text-slate-500">{{ t('Browser notifications aren\'t available on this platform yet.') }}</p>
    <p v-else-if="blocked" class="mt-3 text-xs text-amber-400 light:text-amber-700">{{ t('Notifications are blocked for this site. Allow them in your browser settings, then try again.') }}</p>

    <template v-if="available && preferences.length">
      <p class="mt-4 text-[11px] font-semibold tracking-wider text-white/40 uppercase light:text-slate-500">{{ t('What to push') }}</p>
      <ul class="m-0 mt-1 flex list-none flex-col divide-y divide-white/6 p-0 light:divide-slate-200">
        <li v-for="preference in preferences" :key="preference.type" class="flex items-center justify-between gap-2 py-2.5">
          <span class="text-[13px] text-slate-100 light:text-slate-900">{{ t(EMAIL_TYPE_LABELS[preference.type] ?? preference.type) }}</span>
          <button
            type="button"
            role="switch"
            :aria-checked="preference.enabled"
            :aria-label="t(EMAIL_TYPE_LABELS[preference.type] ?? preference.type)"
            class="relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-wait"
            :class="preference.enabled ? 'bg-brand-500' : 'bg-white/15 light:bg-slate-300'"
            :disabled="savingType === preference.type"
            @click="toggle(preference)"
          >
            <span class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform" :class="preference.enabled ? 'translate-x-4' : ''" />
          </button>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import { BellRing } from 'lucide-vue-next'
import type { PushPreference } from '~/types/push'
import { EMAIL_TYPE_LABELS } from '~/composables/useEmailPreferences'
import { useAppToast } from '~/composables/useAppToast'
import { useWebPush } from '~/composables/useWebPush'
import { getErrorMessage } from '~/utils/apiError'

/** Turns browser push on or off for this device, and picks which notification types are pushed. */
const { t } = useT()
const toast = useAppToast()
const push = useWebPush()
const { supported } = push

const loading = ref(true)
const busy = ref(false)
const serverEnabled = ref(false)
const publicKey = ref<string | null>(null)
const subscribed = ref(false)
const blocked = ref(false)
const preferences = ref<PushPreference[]>([])
const savingType = ref<string | null>(null)

const available = computed(() => supported && serverEnabled.value && Boolean(publicKey.value))

onMounted(async () => {
  try {
    const key = await push.fetchVapidKey()
    serverEnabled.value = key.enabled
    publicKey.value = key.publicKey
    if (supported && key.enabled) {
      blocked.value = Notification.permission === 'denied'
      const [subscription, loaded] = await Promise.all([push.currentSubscription(), push.fetchPreferences()])
      subscribed.value = Boolean(subscription)
      preferences.value = loaded
    }
  } catch {
    serverEnabled.value = false
  } finally {
    loading.value = false
  }
})

async function turnOn() {
  if (!publicKey.value) return
  busy.value = true
  try {
    await push.subscribe(publicKey.value)
    subscribed.value = true
    blocked.value = false
    toast.success(t('Browser notifications on'), t('You\'ll get a pop-up on this device.'))
  } catch (err) {
    blocked.value = Notification.permission === 'denied'
    toast.error(t('Browser notifications not turned on'), err instanceof Error && !('data' in err) ? t(err.message) : getErrorMessage(err, t('Please try again.')))
  } finally {
    busy.value = false
  }
}

async function turnOff() {
  busy.value = true
  try {
    await push.unsubscribe()
    subscribed.value = false
    toast.info(t('Browser notifications off'))
  } catch (err) {
    toast.error(t('Browser notifications not turned off'), getErrorMessage(err, t('Please try again.')))
  } finally {
    busy.value = false
  }
}

async function toggle(preference: PushPreference) {
  savingType.value = preference.type
  try {
    preferences.value = await push.savePreferences([{ type: preference.type, enabled: !preference.enabled }])
  } catch (err) {
    toast.error(t('Preference not saved'), getErrorMessage(err, t('Please try again.')))
  } finally {
    savingType.value = null
  }
}
</script>
