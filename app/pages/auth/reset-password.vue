<template>
  <div>
    <NuxtLink v-if="!success" to="/auth/login" :class="authBackLink">
      <ArrowLeft :size="15" aria-hidden="true" /> Back to log in
    </NuxtLink>

    <!-- Missing or unusable link -->
    <div v-if="!token">
      <div :class="authIconBadgeDanger">
        <Link2Off :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">This link is incomplete</h1>
      <p :class="authSubtitle">Open the reset link from your email again, or request a new one. Reset links expire after 30 minutes.</p>
      <NuxtLink to="/auth/forgot-password" :class="[authPrimaryButton, 'mt-7 short:mt-5']">Request a new link</NuxtLink>
    </div>

    <!-- Done -->
    <div v-else-if="success" role="status">
      <div :class="authIconBadge">
        <CircleCheck :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">Password updated</h1>
      <p :class="authSubtitle">For your security we signed you out on every device. Log in with your new password to continue.</p>
      <NuxtLink to="/auth/login" :class="[authPrimaryButton, 'mt-7 short:mt-5']">
        <span>Log in</span>
        <ArrowRight :size="16" aria-hidden="true" />
      </NuxtLink>
    </div>

    <!-- Form -->
    <template v-else>
      <div :class="authIconBadge">
        <LockKeyhole :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">Set a new password</h1>
      <p :class="authSubtitle">Choose a strong password that you don't use anywhere else.</p>

      <form :class="[authBodyGap, authForm]" novalidate @submit.prevent="handleResetPassword">
        <div v-if="pageError" :class="authAlertError" role="alert">
          <AlertCircle :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {{ pageError }}
            <NuxtLink v-if="linkExpired" to="/auth/forgot-password" class="font-semibold underline underline-offset-2">Request a new link</NuxtLink>
          </span>
        </div>

        <div :class="authField">
          <label for="password" :class="authLabel">New password</label>
          <PasswordInput
            id="password"
            v-model="form.password"
            placeholder="Create a strong password"
            autocomplete="new-password"
            :disabled="loading"
            :invalid="Boolean(errors.password)"
            :describedby="errors.password ? 'password-error password-requirements' : 'password-requirements'"
          />
          <p v-if="errors.password" id="password-error" :class="authFieldError">{{ errors.password }}</p>
          <PasswordStrengthMeter id="password-requirements" :password="form.password" />
        </div>

        <div :class="authField">
          <label for="confirmPassword" :class="authLabel">Confirm new password</label>
          <PasswordInput
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="Re-enter your new password"
            autocomplete="new-password"
            :disabled="loading"
            :invalid="Boolean(errors.confirmPassword)"
            :describedby="errors.confirmPassword ? 'confirmPassword-error' : undefined"
          />
          <p v-if="errors.confirmPassword" id="confirmPassword-error" :class="authFieldError">{{ errors.confirmPassword }}</p>
          <p v-else-if="passwordsMatch" class="flex items-center gap-1.5 text-[12.5px] text-brand-400 light:text-brand-700">
            <Check :size="13" aria-hidden="true" /> Passwords match
          </p>
        </div>

        <button type="submit" :class="[authPrimaryButton, 'mt-1.5']" :disabled="loading" :aria-busy="loading">
          <Loader2 v-if="loading" :size="18" class="animate-spin" aria-hidden="true" />
          <span v-else>Update password</span>
        </button>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Link2Off,
  Loader2,
  LockKeyhole,
} from 'lucide-vue-next'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import {
  authAlertError,
  authBackLink,
  authBodyGap,
  authField,
  authFieldError,
  authForm,
  authIconBadge,
  authIconBadgeDanger,
  authLabel,
  authPrimaryButton,
  authSubtitle,
  authTitle,
} from '~/utils/authUi'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'

const route = useRoute()
const auth = useAuth()
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,100}$/

const loading = ref(false)
const success = ref(false)

const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

const pageError = ref('')
const linkExpired = ref(false)

const token = computed(() => {
  const value = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token
  return typeof value === 'string' ? value.trim() : ''
})

const passwordsMatch = computed(() => {
  return Boolean(form.confirmPassword)
    && form.password === form.confirmPassword
    && PASSWORD_PATTERN.test(form.password)
})

function validateForm() {
  let valid = true
  errors.password = ''
  errors.confirmPassword = ''
  pageError.value = ''
  linkExpired.value = false

  if (!token.value) {
    errors.password = 'Invalid or expired reset token'
    return false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (!PASSWORD_PATTERN.test(form.password)) {
    errors.password = 'Use at least 8 characters with uppercase, lowercase, a number, and a special character'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  return valid
}

async function handleResetPassword() {
  if (!validateForm()) return

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: form.password,
        confirmPassword: form.confirmPassword
      }
    })
    success.value = true
    // Every session was revoked, including this browser's.
    auth.clearAuth()
  } catch (error) {
    const apiError = toApiError(error, 'Failed to reset password')

    if (apiError.fieldErrors.password) errors.password = apiError.fieldErrors.password
    if (apiError.fieldErrors.confirmPassword) errors.confirmPassword = apiError.fieldErrors.confirmPassword

    if (apiError.status === 429) {
      pageError.value = 'Too many attempts. Please wait a moment and try again.'
    } else if (!Object.keys(apiError.fieldErrors).length) {
      pageError.value = apiError.message
      linkExpired.value = apiError.status === 400
    }
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Reset Password',
  meta: [
    { name: 'description', content: 'Reset your CourseAuraHub Academy password' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
