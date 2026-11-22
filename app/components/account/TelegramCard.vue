<template>
  <!-- Channel row on the notifications settings tab -->
  <div class="flex flex-col gap-3 px-5 py-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-400/12 text-sky-300 light:bg-sky-50 light:text-sky-600">
        <Send :size="16" :stroke-width="1.75" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-slate-50 light:text-slate-900">
          {{ t('Telegram') }}
          <span v-if="status?.connected" class="rounded-full bg-brand-500/15 px-2 py-px text-[11px] font-semibold text-brand-300 light:bg-brand-50 light:text-brand-600">
            {{ status.enabled ? t('Connected') : t('Paused') }}
          </span>
        </p>
        <p class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">
          {{ auth.isAdmin ? t('Get enrollment alerts and platform stats in a private chat') : t('Get course updates and check your progress in a private chat') }}
        </p>
      </div>

      <div v-if="loading" class="h-8 w-24 animate-pulse rounded-lg bg-white/6 light:bg-slate-100" />
      <AppSwitch
        v-else-if="status?.connected"
        :model-value="status.enabled"
        :label="t('Send notifications to Telegram')"
        :busy="busy"
        @update:model-value="toggle"
      />
      <button
        v-else-if="status?.available && !connectUrl"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-transparent bg-brand-500 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait disabled:opacity-60"
        :disabled="busy"
        @click="connect"
      >
        <Loader2 v-if="busy" :size="14" class="animate-spin" aria-hidden="true" />
        {{ t('Connect') }}
      </button>
    </div>

    <div class="flex flex-col gap-3 sm:pl-12">
      <div
        v-if="error"
        class="rounded-[10px] border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200 light:border-rose-200 light:bg-negative-bg light:text-negative"
        role="alert"
      >
        {{ error }}
      </div>

      <p v-if="!loading && status && !status.available && !status.connected" class="text-[12.5px] text-white/50 light:text-slate-500">
        {{ t('Telegram notifications aren\'t available on this platform yet.') }}
      </p>

      <!-- Connected -->
      <div v-else-if="status?.connected" class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[12.5px] text-white/50 light:text-slate-500">
        <p>
          {{ t('Connected to') }} <span class="font-semibold text-slate-100 light:text-slate-800">{{ status.telegramName || 'your Telegram account' }}</span>{{ t('. Only you receive messages in this chat.') }}
          <template v-if="!status.enabled"> {{ t('Messages are paused; they still appear in your inbox.') }}</template>
        </p>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1 font-semibold text-rose-300 hover:underline disabled:cursor-not-allowed disabled:opacity-60 light:text-negative"
          :disabled="busy"
          @click="disconnect"
        >
          <Unlink :size="13" aria-hidden="true" /> {{ t('Disconnect') }}
        </button>
      </div>

      <!-- Waiting for the person to press Start in Telegram -->
      <div v-else-if="connectUrl" class="flex flex-col gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.03] p-3.5 light:border-slate-200 light:bg-slate-50">
        <p class="flex items-center gap-2 text-[13px] text-white/70 light:text-slate-700">
          <Loader2 :size="14" class="animate-spin text-brand-300 light:text-brand-600" aria-hidden="true" />
          {{ t('Press') }} <span class="font-semibold text-slate-100 light:text-slate-900">{{ t('Start') }}</span> {{ t('in Telegram to finish. This page updates by itself.') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <a
            :href="connectUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12.5px] font-semibold text-white/80 no-underline hover:text-white light:border-slate-200 light:bg-white light:text-slate-700 light:hover:text-slate-900"
          >
            <ExternalLink :size="13" aria-hidden="true" /> {{ t('Open Telegram again') }}
          </a>
          <button
            type="button"
            class="cursor-pointer rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-white/55 hover:text-white light:text-slate-500 light:hover:text-slate-900"
            @click="stopWaiting"
          >
            {{ t('Cancel') }}
          </button>
        </div>
      </div>

      <!-- Not connected: what you get -->
      <ul v-else-if="status" class="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[12.5px] text-white/50 light:text-slate-500">
        <li v-for="benefit in benefits" :key="benefit" class="inline-flex items-center gap-1.5">
          <Check :size="13" class="shrink-0 text-brand-300 light:text-brand-600" aria-hidden="true" />
          {{ benefit }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ExternalLink, Loader2, Send, Unlink } from 'lucide-vue-next'
import type { TelegramStatus } from '~/types'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useAuth } from '~/composables/useAuth'
import { useTelegram } from '~/composables/useTelegram'
import { toApiError } from '~/utils/apiError'

const { t } = useT()

const POLL_INTERVAL_MS = 3000

const auth = useAuth()
const telegram = useTelegram()
const { success } = useAppToast()

const status = ref<TelegramStatus | null>(null)
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const connectUrl = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null
let linkExpiresAt = 0

const benefits = computed(() => auth.isAdmin
  ? ['New enrollment alerts as they happen', 'Check revenue and students with /stats', 'Only you can see your chat']
  : ['Enrollment, new lesson and certificate updates', 'Check your progress with /progress', 'Only you can see your chat'])

async function run(action: () => Promise<void>, fallback: string) {
  busy.value = true
  error.value = ''
  try {
    await action()
  } catch (err) {
    error.value = toApiError(err, fallback).message
  } finally {
    busy.value = false
  }
}

function stopWaiting() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
  connectUrl.value = ''
}

async function checkConnected() {
  if (Date.now() > linkExpiresAt) {
    stopWaiting()
    error.value = 'That link expired. Choose Connect Telegram to get a new one.'
    return
  }
  const latest = await telegram.fetchStatus().catch(() => null)
  if (latest?.connected) {
    status.value = latest
    stopWaiting()
    success('Telegram connected', 'Your notifications will arrive there.')
  }
}

function connect() {
  // Opened before the request finishes, because browsers block pop-ups that follow an await
  const opened = window.open('', '_blank')
  return run(async () => {
    try {
      const link = await telegram.createConnectLink()
      connectUrl.value = link.url
      linkExpiresAt = new Date(link.expiresAt).getTime()
      if (opened) opened.location.href = link.url
      pollTimer = setInterval(checkConnected, POLL_INTERVAL_MS)
    } catch (err) {
      opened?.close()
      throw err
    }
  }, 'Unable to create a Telegram link')
}

function toggle(enabled: boolean) {
  return run(async () => {
    status.value = await telegram.setEnabled(enabled)
  }, 'Unable to update Telegram notifications')
}

function disconnect() {
  return run(async () => {
    await telegram.disconnect()
    status.value = await telegram.fetchStatus()
    success('Telegram disconnected')
  }, 'Unable to disconnect Telegram')
}

onMounted(async () => {
  try {
    status.value = await telegram.fetchStatus()
  } catch (err) {
    error.value = toApiError(err, 'Unable to load your Telegram connection').message
  } finally {
    loading.value = false
  }
})

onUnmounted(stopWaiting)
</script>
