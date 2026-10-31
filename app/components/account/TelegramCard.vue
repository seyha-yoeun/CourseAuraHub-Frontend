<template>
  <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
      <Send :size="20" class="text-sky-400" />
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Telegram</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">
          {{ auth.isAdmin ? 'Get enrollment alerts and platform stats in a private chat' : 'Get course updates and check your progress in a private chat' }}
        </p>
      </div>
      <span
        v-if="status?.connected"
        class="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700"
      >
        Connected
      </span>
    </div>

    <div
      v-if="error"
      class="mb-3.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
      role="alert"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="h-24 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />

    <p v-else-if="status && !status.available && !status.connected" class="text-[13px] text-white/50 light:text-slate-500">
      Telegram notifications aren't available on this platform yet.
    </p>

    <!-- Connected -->
    <div v-else-if="status?.connected" class="flex flex-col gap-4">
      <p class="text-[13px] text-white/60 light:text-slate-600">
        Connected to <span class="font-semibold text-slate-100 light:text-slate-900">{{ status.telegramName || 'your Telegram account' }}</span>.
        Only you receive messages in this chat.
      </p>

      <label class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3 light:border-slate-200 light:bg-slate-50">
        <span>
          <span class="block text-[13px] font-semibold text-slate-100 light:text-slate-900">Send notifications to Telegram</span>
          <span class="mt-0.5 block text-[11px] text-white/40 light:text-slate-500">Turn off to pause them. They'll still appear in the app.</span>
        </span>
        <input
          type="checkbox"
          class="size-4 shrink-0 cursor-pointer accent-violet-500"
          :checked="status.enabled"
          :disabled="busy"
          @change="toggle(($event.target as HTMLInputElement).checked)"
        >
      </label>

      <div>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 light:border-rose-200 light:bg-rose-50 light:text-rose-700"
          :disabled="busy"
          @click="disconnect"
        >
          <Unlink :size="14" /> Disconnect
        </button>
      </div>
    </div>

    <!-- Waiting for the person to press Start in Telegram -->
    <div v-else-if="connectUrl" class="flex flex-col gap-3">
      <p class="text-[13px] text-white/60 light:text-slate-600">
        Press <span class="font-semibold text-slate-100 light:text-slate-900">Start</span> in Telegram to finish. This page updates by itself.
      </p>
      <p class="inline-flex items-center gap-2 text-xs text-white/45 light:text-slate-500">
        <Loader2 :size="14" class="animate-spin" /> Waiting for Telegram...
      </p>
      <div class="flex flex-wrap gap-2">
        <a
          :href="connectUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 no-underline hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 light:hover:text-slate-900"
        >
          <ExternalLink :size="14" /> Open Telegram again
        </a>
        <button
          type="button"
          class="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-900"
          @click="stopWaiting"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Not connected -->
    <div v-else-if="status" class="flex flex-col gap-4">
      <ul class="flex flex-col gap-2 text-[13px] text-white/60 light:text-slate-600">
        <li v-for="benefit in benefits" :key="benefit" class="flex items-start gap-2">
          <Check :size="15" class="mt-0.5 shrink-0 text-emerald-400" />
          <span>{{ benefit }}</span>
        </li>
      </ul>
      <div>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60"
          :disabled="busy"
          @click="connect"
        >
          <Send :size="15" /> Connect Telegram
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ExternalLink, Loader2, Send, Unlink } from 'lucide-vue-next'
import type { TelegramStatus } from '~/types'
import { useAppToast } from '~/composables/useAppToast'
import { useAuth } from '~/composables/useAuth'
import { useTelegram } from '~/composables/useTelegram'
import { toApiError } from '~/utils/apiError'

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
