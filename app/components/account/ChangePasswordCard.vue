<template>
  <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
      <KeyRound :size="20" class="text-violet-400" />
      <div>
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Password</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Changing it signs out every other device</p>
      </div>
    </div>

    <div
      v-if="!hasPassword"
      class="rounded-xl border border-white/5 bg-white/2 p-3.5 text-[13px] leading-relaxed text-white/55 light:border-slate-200 light:bg-slate-50 light:text-slate-600"
    >
      You sign in with {{ providerLabel }}, so this account has no password to change.
      To add one, sign out and use
      <NuxtLink to="/auth/forgot-password" class="font-semibold text-violet-400 no-underline hover:underline light:text-violet-600">Forgot password</NuxtLink>
      with your account email.
    </div>

    <form v-else class="flex flex-col gap-3.5" @submit.prevent="handleSubmit">
      <Transition v-bind="alertAnim">
        <div v-if="saved" class="flex items-center gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/12 px-4 py-2.5 text-[13px] font-medium text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700">
          <CheckCircle2 :size="16" />
          <span>Password updated. Other devices have been signed out.</span>
        </div>
      </Transition>

      <div
        v-if="formError"
        class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
        role="alert"
      >
        {{ formError }}
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="current-password" class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Current Password</label>
        <input
          id="current-password"
          v-model="form.currentPassword"
          type="password"
          autocomplete="current-password"
          :class="errors.currentPassword ? inputErrorClass : inputClass"
          :disabled="saving"
        >
        <p v-if="errors.currentPassword" class="text-xs text-red-500">{{ errors.currentPassword }}</p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="flex flex-1 flex-col gap-1.5">
          <label for="new-password" class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">New Password</label>
          <input
            id="new-password"
            v-model="form.newPassword"
            type="password"
            autocomplete="new-password"
            :class="errors.newPassword ? inputErrorClass : inputClass"
            :disabled="saving"
          >
          <p v-if="errors.newPassword" class="text-xs text-red-500">{{ errors.newPassword }}</p>
        </div>
        <div class="flex flex-1 flex-col gap-1.5">
          <label for="confirm-password" class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Confirm New Password</label>
          <input
            id="confirm-password"
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            :class="errors.confirmPassword ? inputErrorClass : inputClass"
            :disabled="saving"
          >
          <p v-if="errors.confirmPassword" class="text-xs text-red-500">{{ errors.confirmPassword }}</p>
        </div>
      </div>

      <PasswordStrengthMeter :password="form.newPassword" :show="!!form.newPassword" />

      <div class="flex justify-end">
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5.5 py-2.5 text-[13px] font-semibold text-white transition-all enabled:hover:from-violet-500 enabled:hover:to-indigo-500 enabled:hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          :disabled="saving"
        >
          <Loader2 v-if="saving" :size="16" class="animate-spin" />
          <Save v-else :size="16" />
          <span>{{ saving ? 'Updating...' : 'Update Password' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, KeyRound, Loader2, Save } from 'lucide-vue-next'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'

const emit = defineEmits<{ changed: [] }>()

const auth = useAuth()
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,100}$/

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const saving = ref(false)
const saved = ref(false)
const formError = ref('')
let savedTimer: ReturnType<typeof setTimeout> | undefined

// OAuth-created accounts have no password; local accounts keep provider LOCAL even after linking.
const hasPassword = computed(() => !auth.user?.provider || auth.user.provider === 'LOCAL')
const providerLabel = computed(() => {
  const provider = auth.user?.provider?.toLowerCase() || ''
  return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'a social provider'
})

const inputClass = 'w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 disabled:opacity-60 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600'
const inputErrorClass = 'w-full rounded-[10px] border border-red-500 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none ring-2 ring-red-500/15 transition-all duration-200 focus:border-red-500 disabled:opacity-60 light:bg-white light:text-slate-900'

const alertAnim = {
  enterActiveClass: 'transition-all duration-300 ease-out',
  leaveActiveClass: 'transition-all duration-300 ease-out',
  enterFromClass: 'opacity-0 -translate-y-2',
  leaveToClass: 'opacity-0 -translate-y-2'
}

function validate() {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  formError.value = ''

  let valid = true

  if (!form.currentPassword) {
    errors.currentPassword = 'Current password is required'
    valid = false
  }

  if (!PASSWORD_PATTERN.test(form.newPassword)) {
    errors.newPassword = 'Use at least 8 characters with uppercase, lowercase, a number, and a special character'
    valid = false
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'Choose a password you have not used for this account'
    valid = false
  }

  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  saving.value = true
  saved.value = false

  try {
    await auth.changePassword(form.currentPassword, form.newPassword)

    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    saved.value = true
    emit('changed')

    if (savedTimer) clearTimeout(savedTimer)
    savedTimer = setTimeout(() => { saved.value = false }, 5000)
  } catch (error) {
    const apiError = toApiError(error, 'Unable to change your password')

    if (apiError.fieldErrors.currentPassword) errors.currentPassword = apiError.fieldErrors.currentPassword
    if (apiError.fieldErrors.newPassword) errors.newPassword = apiError.fieldErrors.newPassword

    if (!Object.keys(apiError.fieldErrors).length) {
      if (/current password/i.test(apiError.message)) errors.currentPassword = apiError.message
      else formError.value = apiError.message
    }
  } finally {
    saving.value = false
  }
}

onUnmounted(() => {
  if (savedTimer) clearTimeout(savedTimer)
})
</script>
