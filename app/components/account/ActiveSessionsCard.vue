<template>
  <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
      <MonitorSmartphone :size="20" class="text-blue-400" />
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Where You're Signed In</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Sign out any device you don't recognise</p>
      </div>
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 light:text-slate-400 light:hover:bg-slate-100 light:hover:text-slate-700"
        aria-label="Refresh sessions"
        :disabled="pending"
        @click="loadSessions"
      >
        <RefreshCw :size="16" :class="{ 'animate-spin': pending }" />
      </button>
    </div>

    <div
      v-if="error"
      class="mb-3.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
      role="alert"
    >
      {{ error }}
    </div>

    <div v-if="pending && !sessions.length" class="flex flex-col gap-2.5">
      <div v-for="index in 2" :key="index" class="h-16 w-full animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />
    </div>

    <ul v-else class="flex flex-col gap-2.5">
      <li
        v-for="session in sortedSessions"
        :key="session.sessionId"
        class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-3 light:border-slate-200 light:bg-slate-50"
      >
        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/60 light:border-slate-200 light:bg-white light:text-slate-500">
          <component :is="describe(session).mobile ? Smartphone : Monitor" :size="18" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="truncate text-[13px] font-semibold text-slate-200 light:text-slate-800">{{ describe(session).label }}</span>
            <span
              v-if="session.current"
              class="rounded-full border border-emerald-400/25 bg-emerald-400/12 px-1.5 py-px text-[10px] font-bold text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700"
            >This device</span>
            <span
              v-if="session.rememberMe"
              class="rounded-full border border-white/10 bg-white/5 px-1.5 py-px text-[10px] font-semibold text-white/50 light:border-slate-200 light:bg-white light:text-slate-500"
            >Remembered</span>
          </div>
          <p class="mt-0.5 truncate text-[11px] text-white/40 light:text-slate-500">
            <span v-if="session.ipAddress">{{ session.ipAddress }} · </span>
            <span>Active {{ formatRelative(session.lastUsedAt || session.createdAt) }}</span>
            <span> · Signed in {{ formatDate(session.createdAt) }}</span>
          </p>
        </div>

        <button
          v-if="!session.current"
          type="button"
          class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[12px] font-medium text-white/70 transition-all enabled:hover:border-rose-500/30 enabled:hover:bg-rose-500/10 enabled:hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50 light:border-slate-200 light:bg-white light:text-slate-600 light:enabled:hover:border-rose-200 light:enabled:hover:bg-rose-50 light:enabled:hover:text-rose-700"
          :disabled="revoking === session.sessionId"
          @click="revokeSession(session)"
        >
          <Loader2 v-if="revoking === session.sessionId" :size="13" class="animate-spin" />
          <LogOut v-else :size="13" />
          <span>Sign out</span>
        </button>
      </li>

      <li v-if="!pending && !sessions.length" class="py-4 text-center text-[13px] text-white/40 light:text-slate-500">
        No active sessions found.
      </li>
    </ul>

    <!-- Sign out everywhere -->
    <div class="mt-5 flex flex-col gap-3 border-t border-white/6 pt-4 sm:flex-row sm:items-center sm:justify-between light:border-slate-200">
      <p class="text-[12px] text-white/45 light:text-slate-500">
        <template v-if="confirmingLogoutAll">This signs out every device, including this one.</template>
        <template v-else>Lost a device or shared a password? Sign out everywhere at once.</template>
      </p>
      <div class="flex shrink-0 gap-2.5">
        <button
          v-if="confirmingLogoutAll"
          type="button"
          class="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
          :disabled="auth.loading"
          @click="confirmingLogoutAll = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-500/40 bg-linear-to-br from-rose-600 to-rose-700 px-4 py-2 text-[13px] font-semibold text-white transition-all enabled:hover:from-rose-500 enabled:hover:to-rose-600 enabled:hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60"
          :disabled="auth.loading"
          @click="handleLogoutAll"
        >
          <Loader2 v-if="auth.loading" :size="15" class="animate-spin" />
          <LogOut v-else :size="15" />
          <span>{{ confirmingLogoutAll ? 'Yes, Sign Out All' : 'Sign Out All Devices' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Loader2,
  LogOut,
  Monitor,
  MonitorSmartphone,
  RefreshCw,
  Smartphone,
} from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'

interface AuthSession {
  sessionId: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  rememberMe: boolean
  current: boolean
}

const auth = useAuth()
const { success } = useAppToast()

const sessions = ref<AuthSession[]>([])
const pending = ref(false)
const error = ref('')
const revoking = ref('')
const confirmingLogoutAll = ref(false)

const sortedSessions = computed(() => [...sessions.value].sort((a, b) => {
  if (a.current !== b.current) return a.current ? -1 : 1
  return new Date(b.lastUsedAt || b.createdAt).getTime() - new Date(a.lastUsedAt || a.createdAt).getTime()
}))

const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

function formatRelative(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  if (Number.isNaN(seconds)) return 'recently'

  const abs = Math.abs(seconds)
  if (abs < 60) return 'just now'
  if (abs < 3600) return relativeFormat.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return relativeFormat.format(Math.round(seconds / 3600), 'hour')
  return relativeFormat.format(Math.round(seconds / 86400), 'day')
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)
}

function describe(session: AuthSession) {
  const agent = session.userAgent || ''

  const browser = /Edg\//.test(agent) ? 'Edge'
    : /OPR\/|Opera/.test(agent) ? 'Opera'
      : /Firefox\//.test(agent) ? 'Firefox'
        : /Chrome\//.test(agent) ? 'Chrome'
          : /Safari\//.test(agent) ? 'Safari'
            : ''

  const os = /iPhone|iPad|iPod/.test(agent) ? 'iOS'
    : /Android/.test(agent) ? 'Android'
      : /Windows/.test(agent) ? 'Windows'
        : /Mac OS X|Macintosh/.test(agent) ? 'macOS'
          : /Linux/.test(agent) ? 'Linux'
            : ''

  const label = browser && os ? `${browser} on ${os}` : browser || os || 'Unknown device'

  return {
    label,
    mobile: /Mobi|iPhone|iPad|Android/.test(agent),
  }
}

async function loadSessions() {
  pending.value = true
  error.value = ''

  try {
    sessions.value = await $fetch<AuthSession[]>('/api/auth/sessions', { credentials: 'include' })
  } catch (loadError) {
    error.value = toApiError(loadError, 'Unable to load your sessions').message
  } finally {
    pending.value = false
  }
}

async function revokeSession(session: AuthSession) {
  revoking.value = session.sessionId
  error.value = ''

  try {
    await $fetch(`/api/auth/sessions/${session.sessionId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    sessions.value = sessions.value.filter(item => item.sessionId !== session.sessionId)
    success('Device Signed Out', `${describe(session).label} can no longer access your account.`)
  } catch (revokeError) {
    error.value = toApiError(revokeError, 'Unable to sign out that device').message
  } finally {
    revoking.value = ''
  }
}

async function handleLogoutAll() {
  if (!confirmingLogoutAll.value) {
    confirmingLogoutAll.value = true
    return
  }

  error.value = ''

  try {
    await auth.logoutAll()
  } catch (logoutError) {
    error.value = toApiError(logoutError, 'Unable to sign out of all devices').message
    confirmingLogoutAll.value = false
  }
}

defineExpose({ refresh: loadSessions })

onMounted(loadSessions)
</script>
