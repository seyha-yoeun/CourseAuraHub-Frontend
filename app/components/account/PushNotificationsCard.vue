<template>
  <!-- Channel row: turns browser push on/off for this device. Which types are pushed lives in NotificationPreferencesTable. -->
  <div class="flex flex-col gap-2 px-5 py-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/6 text-white/70 light:bg-slate-100 light:text-slate-600">
        <Monitor :size="17" :stroke-width="1.75" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-slate-50 light:text-slate-900">
          {{ t('Browser notifications') }}
          <span v-if="available && subscribed" :class="onBadge">{{ t('On for this device') }}</span>
        </p>
        <p class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">{{ t('Get a pop-up on this device, even when the site is closed.') }}</p>
      </div>
      <div v-if="loading" class="h-8 w-24 animate-pulse rounded-lg bg-white/6 light:bg-slate-100" />
      <button
        v-else-if="available"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait disabled:opacity-60"
        :class="subscribed
          ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/9 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50'
          : 'border-transparent bg-brand-500 text-white hover:bg-brand-600'"
        :disabled="busy"
        @click="subscribed ? turnOff() : turnOn()"
      >
        <Loader2 v-if="busy" :size="14" class="animate-spin" aria-hidden="true" />
        {{ subscribed ? t('Turn off') : t('Turn on') }}
      </button>
    </div>

    <p v-if="!loading && !supported" :class="note">{{ t('This browser doesn\'t support notifications.') }}</p>
    <p v-else-if="!loading && !serverEnabled" :class="note">{{ t('Browser notifications aren\'t available on this platform yet.') }}</p>
    <p v-else-if="!loading && blocked" :class="[note, 'text-amber-300 light:text-warning']">
      {{ t('Notifications are blocked for this site. Allow them in your browser settings, then try again.') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Monitor } from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'
import { useWebPush } from '~/composables/useWebPush'
import { getErrorMessage } from '~/utils/apiError'

/** Turns browser push on or off for this device. */
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

const note = 'text-[12.5px] text-white/50 sm:pl-12 light:text-slate-500'
const onBadge = 'rounded-full bg-brand-500/15 px-2 py-px text-[11px] font-semibold text-brand-300 light:bg-brand-50 light:text-brand-600'

const available = computed(() => supported && serverEnabled.value && Boolean(publicKey.value))

onMounted(async () => {
  try {
    const key = await push.fetchVapidKey()
    serverEnabled.value = key.enabled
    publicKey.value = key.publicKey
    if (supported && key.enabled) {
      blocked.value = Notification.permission === 'denied'
      subscribed.value = Boolean(await push.currentSubscription())
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

</script>
