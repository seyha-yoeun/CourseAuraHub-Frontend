<template>
  <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
      <ShieldCheck :size="20" class="text-emerald-400" />
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Two-Factor Authentication</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Require a code from your authenticator app at sign-in</p>
      </div>
      <span
        v-if="status"
        :class="[
          'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
          status.enabled
            ? 'border-emerald-400/25 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
            : 'border-white/10 bg-white/5 text-white/50 light:border-slate-200 light:bg-slate-100 light:text-slate-500',
        ]"
      >
        {{ status.enabled ? 'On' : 'Off' }}
      </span>
    </div>

    <div v-if="pending" class="h-28 w-full animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />

    <div
      v-else-if="loadError"
      class="flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-[13px] text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
    >
      <span>{{ loadError }}</span>
      <button type="button" class="inline-flex cursor-pointer items-center gap-1.5 font-semibold underline" @click="loadStatus">
        <RefreshCw :size="14" />
        Try again
      </button>
    </div>

    <template v-else-if="status">
      <div
        v-if="actionError"
        class="mb-3.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
        role="alert"
      >
        {{ actionError }}
      </div>

      <!-- Freshly issued recovery codes (shown once) -->
      <div v-if="recoveryCodes.length" class="flex flex-col gap-3.5">
        <div class="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-[13px] leading-relaxed text-amber-200 light:border-amber-200 light:bg-amber-50 light:text-amber-800">
          <AlertTriangle :size="18" class="mt-0.5 shrink-0" />
          <span>Save these recovery codes somewhere safe. Each one works once if you lose your device, and they won't be shown again.</span>
        </div>

        <ul class="grid grid-cols-2 gap-2 rounded-xl border border-white/6 bg-white/3 p-3.5 font-mono text-[13px] text-slate-100 light:border-slate-200 light:bg-slate-50 light:text-slate-800">
          <li v-for="recoveryCode in recoveryCodes" :key="recoveryCode" class="text-center tracking-wider">{{ recoveryCode }}</li>
        </ul>

        <div class="flex flex-wrap justify-end gap-2.5">
          <button type="button" :class="secondaryButtonClass" @click="copyRecoveryCodes">
            <Check v-if="copied === 'codes'" :size="15" class="text-emerald-400" />
            <Copy v-else :size="15" />
            <span>{{ copied === 'codes' ? 'Copied' : 'Copy' }}</span>
          </button>
          <button type="button" :class="secondaryButtonClass" @click="downloadRecoveryCodes">
            <Download :size="15" />
            <span>Download</span>
          </button>
          <button type="button" :class="primaryButtonClass" @click="recoveryCodes = []">
            <Check :size="16" />
            <span>I've saved them</span>
          </button>
        </div>
      </div>

      <!-- Server not configured for 2FA -->
      <div
        v-else-if="!status.available && !status.enabled"
        class="rounded-xl border border-white/5 bg-white/2 p-3.5 text-[13px] leading-relaxed text-white/55 light:border-slate-200 light:bg-slate-50 light:text-slate-600"
      >
        Two-factor authentication isn't available on this server yet. Ask an administrator to configure it.
      </div>

      <!-- Enrollment -->
      <div v-else-if="setup" class="flex flex-col gap-4">
        <ol class="flex flex-col gap-4 text-[13px] text-white/70 light:text-slate-600">
          <li class="flex flex-col gap-3 sm:flex-row sm:items-start">
            <img
              :src="qrImage"
              alt="QR code for your authenticator app"
              class="mx-auto size-40 shrink-0 rounded-xl bg-white p-2 sm:mx-0"
            >
            <div class="flex min-w-0 flex-col gap-2">
              <p><span class="font-semibold text-slate-100 light:text-slate-900">1. Scan the QR code</span> with Google Authenticator, Microsoft Authenticator, 1Password or a similar app.</p>
              <p>Can't scan it? Enter this key manually:</p>
              <div class="flex items-center gap-2 rounded-[10px] border border-white/9 bg-white/4 px-3 py-2 light:border-slate-300 light:bg-slate-50">
                <code class="min-w-0 flex-1 font-mono text-[12px] break-all text-slate-100 light:text-slate-900">{{ formattedSecret }}</code>
                <button
                  type="button"
                  class="shrink-0 cursor-pointer text-white/50 transition-colors hover:text-violet-400 light:text-slate-500"
                  :aria-label="copied === 'secret' ? 'Copied' : 'Copy setup key'"
                  @click="copySecret"
                >
                  <Check v-if="copied === 'secret'" :size="15" class="text-emerald-400" />
                  <Copy v-else :size="15" />
                </button>
              </div>
            </div>
          </li>
          <li class="flex flex-col gap-2.5">
            <p><span class="font-semibold text-slate-100 light:text-slate-900">2. Enter the 6-digit code</span> the app shows to finish.</p>
            <OtpCodeInput
              v-model="code"
              label="Authenticator code"
              :disabled="busy"
              :invalid="Boolean(codeError)"
              @complete="confirmSetup"
            />
            <p v-if="codeError" class="text-xs text-red-500">{{ codeError }}</p>
          </li>
        </ol>

        <div class="flex flex-wrap justify-end gap-2.5">
          <button type="button" :class="secondaryButtonClass" :disabled="busy" @click="cancelAction">Cancel</button>
          <button type="button" :class="primaryButtonClass" :disabled="busy || code.length !== 6" @click="confirmSetup">
            <Loader2 v-if="busy" :size="16" class="animate-spin" />
            <ShieldCheck v-else :size="16" />
            <span>{{ busy ? 'Verifying...' : 'Turn On' }}</span>
          </button>
        </div>
      </div>

      <!-- Disabled -->
      <div v-else-if="!status.enabled" class="flex flex-col gap-4">
        <p class="text-[13px] leading-relaxed text-white/55 light:text-slate-600">
          Add a second step to sign-in. Even if someone learns your password, they can't get in without your phone.
          <template v-if="status.enrollmentPending"> You started setting this up earlier but didn't finish.</template>
        </p>
        <div class="flex justify-end">
          <button type="button" :class="primaryButtonClass" :disabled="busy" @click="startSetup">
            <Loader2 v-if="busy" :size="16" class="animate-spin" />
            <Smartphone v-else :size="16" />
            <span>{{ status.enrollmentPending ? 'Restart Setup' : 'Set Up Authenticator' }}</span>
          </button>
        </div>
      </div>

      <!-- Enabled -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/2 p-3 light:border-slate-200 light:bg-slate-50">
          <div>
            <span class="block text-[13px] font-semibold text-slate-200 light:text-slate-800">Recovery codes</span>
            <span
              :class="[
                'mt-0.5 block text-[11px]',
                status.remainingRecoveryCodes <= 3 ? 'text-amber-400 light:text-amber-700' : 'text-white/40 light:text-slate-500',
              ]"
            >
              {{ status.remainingRecoveryCodes }} unused {{ status.remainingRecoveryCodes === 1 ? 'code' : 'codes' }} left
              <template v-if="status.remainingRecoveryCodes <= 3"> — generate new ones soon</template>
            </span>
          </div>
          <KeyRound :size="18" class="shrink-0 text-white/30 light:text-slate-400" />
        </div>

        <!-- Code (and password) confirmation for sensitive actions -->
        <form v-if="action" class="flex flex-col gap-3" @submit.prevent="submitAction">
          <p class="text-[13px] text-white/60 light:text-slate-600">
            <template v-if="action === 'disable'">To turn off two-factor authentication, confirm with a code from your app or an unused recovery code.</template>
            <template v-else>Confirm with a code from your app. Your current recovery codes will stop working.</template>
          </p>

          <div class="flex flex-col gap-3 sm:flex-row">
            <div class="flex flex-1 flex-col gap-1.5">
              <label for="mfa-action-code" class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">
                {{ action === 'disable' ? 'Code or recovery code' : 'Authenticator code' }}
              </label>
              <input
                id="mfa-action-code"
                ref="actionCodeInput"
                v-model="code"
                type="text"
                :inputmode="action === 'disable' ? 'text' : 'numeric'"
                autocomplete="one-time-code"
                spellcheck="false"
                :class="codeError ? inputErrorClass : inputClass"
                :disabled="busy"
              >
            </div>
            <div v-if="action === 'disable' && hasPassword" class="flex flex-1 flex-col gap-1.5">
              <label for="mfa-action-password" class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Current Password</label>
              <input
                id="mfa-action-password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                :class="inputClass"
                :disabled="busy"
              >
            </div>
          </div>
          <p v-if="codeError" class="text-xs text-red-500">{{ codeError }}</p>

          <div class="flex flex-wrap justify-end gap-2.5">
            <button type="button" :class="secondaryButtonClass" :disabled="busy" @click="cancelAction">Cancel</button>
            <button type="submit" :class="action === 'disable' ? dangerButtonClass : primaryButtonClass" :disabled="busy || !code.trim()">
              <Loader2 v-if="busy" :size="16" class="animate-spin" />
              <span>{{ action === 'disable' ? 'Turn Off 2FA' : 'Generate New Codes' }}</span>
            </button>
          </div>
        </form>

        <div v-else class="flex flex-wrap justify-end gap-2.5">
          <button type="button" :class="secondaryButtonClass" @click="beginAction('regenerate')">
            <RefreshCw :size="15" />
            <span>New Recovery Codes</span>
          </button>
          <button type="button" :class="dangerOutlineButtonClass" @click="beginAction('disable')">
            <ShieldOff :size="15" />
            <span>Turn Off</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { renderSVG } from 'uqr'
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from 'lucide-vue-next'
import OtpCodeInput from '~/components/auth/OtpCodeInput.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'

interface MfaStatus {
  enabled: boolean
  enrollmentPending: boolean
  remainingRecoveryCodes: number
  available: boolean
}

interface TotpSetup {
  secret: string
  otpauthUri: string
  digits: number
  periodSeconds: number
}

type SensitiveAction = 'disable' | 'regenerate'

const auth = useAuth()
const { success } = useAppToast()

const status = ref<MfaStatus | null>(null)
const pending = ref(true)
const loadError = ref('')
const actionError = ref('')
const busy = ref(false)
const setup = ref<TotpSetup | null>(null)
const recoveryCodes = ref<string[]>([])
const action = ref<SensitiveAction | null>(null)
const code = ref('')
const codeError = ref('')
const password = ref('')
const copied = ref<'codes' | 'secret' | ''>('')
const actionCodeInput = ref<HTMLInputElement | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const hasPassword = computed(() => !auth.user?.provider || auth.user.provider === 'LOCAL')

// Rendered locally: the secret inside the otpauth URI must never reach a third-party QR service.
const qrImage = computed(() => setup.value
  ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderSVG(setup.value.otpauthUri, { whiteColor: '#ffffff', blackColor: '#0f172a' }))}`
  : '')

const formattedSecret = computed(() => setup.value?.secret.replace(/(.{4})/g, '$1 ').trim() || '')

const inputClass = 'w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 disabled:opacity-60 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600'
const inputErrorClass = 'w-full rounded-[10px] border border-red-500 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none ring-2 ring-red-500/15 transition-all duration-200 focus:border-red-500 disabled:opacity-60 light:bg-white light:text-slate-900'
const primaryButtonClass = 'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white transition-all enabled:hover:from-violet-500 enabled:hover:to-indigo-500 enabled:hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60'
const secondaryButtonClass = 'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4.5 py-2.5 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900'
const dangerButtonClass = 'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-500/40 bg-linear-to-br from-rose-600 to-rose-700 px-5 py-2.5 text-[13px] font-semibold text-white transition-all enabled:hover:from-rose-500 enabled:hover:to-rose-600 enabled:hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60'
const dangerOutlineButtonClass = 'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/8 px-4.5 py-2.5 text-[13px] font-medium text-rose-300 transition-all hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-rose-200 light:bg-rose-50 light:text-rose-700 light:hover:bg-rose-100'

async function loadStatus() {
  pending.value = true
  loadError.value = ''

  try {
    status.value = await $fetch<MfaStatus>('/api/auth/mfa/status', { credentials: 'include' })
    auth.updateUser({ mfaEnabled: status.value.enabled })
  } catch (error) {
    loadError.value = toApiError(error, 'Unable to load two-factor status').message
  } finally {
    pending.value = false
  }
}

function resetForm() {
  code.value = ''
  codeError.value = ''
  password.value = ''
  actionError.value = ''
}

function cancelAction() {
  setup.value = null
  action.value = null
  resetForm()
  // An abandoned enrollment is reported as pending by the server.
  loadStatus()
}

function applyError(error: unknown, fallback: string) {
  const apiError = toApiError(error, fallback)

  if (apiError.status === 400) {
    codeError.value = apiError.fieldErrors.code || apiError.message
    code.value = ''
  } else if (apiError.status === 503) {
    actionError.value = 'Two-factor authentication is temporarily unavailable. Please try again later.'
  } else {
    actionError.value = apiError.message
  }
}

async function startSetup() {
  resetForm()
  busy.value = true

  try {
    setup.value = await $fetch<TotpSetup>('/api/auth/mfa/totp/setup', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    applyError(error, 'Unable to start two-factor setup')
  } finally {
    busy.value = false
  }
}

async function confirmSetup() {
  if (busy.value || code.value.length !== 6) return

  codeError.value = ''
  actionError.value = ''
  busy.value = true

  try {
    const response = await $fetch<{ recoveryCodes: string[] }>('/api/auth/mfa/totp/confirm', {
      method: 'POST',
      credentials: 'include',
      body: { code: code.value },
    })

    recoveryCodes.value = response.recoveryCodes
    setup.value = null
    resetForm()
    success('Two-Factor Enabled', 'You will be asked for a code the next time you sign in.')
    await loadStatus()
  } catch (error) {
    applyError(error, 'Unable to enable two-factor authentication')
  } finally {
    busy.value = false
  }
}

async function beginAction(next: SensitiveAction) {
  resetForm()
  action.value = next
  await nextTick()
  actionCodeInput.value?.focus()
}

async function submitAction() {
  if (busy.value || !action.value || !code.value.trim()) return

  codeError.value = ''
  actionError.value = ''
  busy.value = true

  try {
    if (action.value === 'disable') {
      await $fetch('/api/auth/mfa/disable', {
        method: 'POST',
        credentials: 'include',
        body: { code: code.value.trim(), password: password.value || undefined },
      })
      success('Two-Factor Disabled', 'Sign-in now only requires your password.')
    } else {
      const response = await $fetch<{ recoveryCodes: string[] }>('/api/auth/mfa/recovery-codes', {
        method: 'POST',
        credentials: 'include',
        body: { code: code.value.trim() },
      })
      recoveryCodes.value = response.recoveryCodes
    }

    action.value = null
    resetForm()
    await loadStatus()
  } catch (error) {
    applyError(error, 'Unable to complete the request')
  } finally {
    busy.value = false
  }
}

function flagCopied(target: 'codes' | 'secret') {
  copied.value = target
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copied.value = '' }, 2000)
}

async function copyText(text: string, target: 'codes' | 'secret') {
  try {
    await navigator.clipboard.writeText(text)
    flagCopied(target)
  } catch {
    actionError.value = 'Copy failed. Select the text and copy it manually.'
  }
}

function copySecret() {
  if (setup.value) copyText(setup.value.secret, 'secret')
}

function copyRecoveryCodes() {
  copyText(recoveryCodes.value.join('\n'), 'codes')
}

function downloadRecoveryCodes() {
  const content = [
    'CourseAuraHub Academy recovery codes',
    `Account: ${auth.userEmail}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    'Each code can be used once to sign in without your authenticator app.',
    '',
    ...recoveryCodes.value,
    '',
  ].join('\n')

  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'courseaurahub-recovery-codes.txt'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(loadStatus)

onUnmounted(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>
