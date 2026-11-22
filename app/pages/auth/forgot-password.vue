<template>
  <div>
    <NuxtLink to="/auth/login" :class="authBackLink">
      <ArrowLeft :size="15" aria-hidden="true" /> Back to log in
    </NuxtLink>

    <!-- Request form -->
    <template v-if="!submitted">
      <div :class="authIconBadge">
        <KeyRound :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">Forgot your password?</h1>
      <p :class="authSubtitle">Enter the email you signed up with and we'll send you a link to reset it.</p>

      <form :class="[authBodyGap, authForm]" novalidate @submit.prevent="handleForgotPassword">
        <div :class="authField">
          <label for="email" :class="authLabel">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :class="errors.email ? authInputError : authInput"
            placeholder="you@example.com"
            autocomplete="email"
            inputmode="email"
            autofocus
            required
            :disabled="loading"
            :aria-invalid="Boolean(errors.email) || undefined"
            :aria-describedby="errors.email ? 'email-error' : undefined"
          >
          <p v-if="errors.email" id="email-error" :class="authFieldError">{{ errors.email }}</p>
        </div>

        <button type="submit" :class="[authPrimaryButton, 'mt-1.5']" :disabled="loading" :aria-busy="loading">
          <Loader2 v-if="loading" :size="18" class="animate-spin" aria-hidden="true" />
          <span v-else>Send reset link</span>
        </button>
      </form>
    </template>

    <!-- Sent -->
    <div v-else role="status">
      <div :class="authIconBadge">
        <MailCheck :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">Check your inbox</h1>
      <p :class="authSubtitle">
        If an account exists for <strong class="font-semibold break-all text-slate-100 light:text-slate-900">{{ form.email }}</strong>,
        a password reset link is on its way. It expires in 30 minutes and works once.
      </p>

      <div class="mt-7 flex flex-col gap-2.5 short:mt-5">
        <NuxtLink to="/auth/login" :class="authPrimaryButton">Back to log in</NuxtLink>
        <button type="button" :class="authSecondaryButton" @click="useDifferentEmail">
          Use a different email
        </button>
      </div>

      <p :class="[authFooterText, 'mt-7 text-[13.5px]']">
        Didn't get it? Check your spam folder or
        <button
          type="button"
          :class="[authLink, 'cursor-pointer disabled:cursor-not-allowed disabled:text-white/35 disabled:no-underline light:disabled:text-slate-400']"
          :disabled="loading || cooldown > 0"
          @click="resendEmail"
        >
          {{ cooldown > 0 ? `resend in ${cooldown}s` : 'resend the email' }}
        </button>
      </p>
      <p v-if="errors.email" :class="[authFieldError, 'mt-3 justify-center']" role="alert">{{ errors.email }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, reactive } from 'vue'
import { toApiError } from '~/utils/apiError'
import { ArrowLeft, KeyRound, Loader2, MailCheck } from 'lucide-vue-next'
import {
  authBackLink,
  authBodyGap,
  authField,
  authFieldError,
  authFooterText,
  authForm,
  authIconBadge,
  authInput,
  authInputError,
  authLabel,
  authLink,
  authPrimaryButton,
  authSecondaryButton,
  authSubtitle,
  authTitle,
} from '~/utils/authUi'

const RESEND_COOLDOWN_MS = 60 * 1000

const toast = useAppToast()

const loading = ref(false)
const submitted = ref(false)
const resendAvailableAt = ref(0)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined

const cooldown = computed(() => Math.max(0, Math.ceil((resendAvailableAt.value - now.value) / 1000)))

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

function validateEmail() {
  errors.email = ''
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    return false
  }
  return true
}

async function sendResetEmail() {
  if (!validateEmail()) return false

  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: form.email.trim() }
    })
    resendAvailableAt.value = Date.now() + RESEND_COOLDOWN_MS
    return true
  } catch (error) {
    const apiError = toApiError(error, 'Failed to send reset email')
    errors.email = apiError.status === 429
      ? 'Too many requests. Please wait a moment and try again.'
      : apiError.fieldErrors.email || apiError.message
    return false
  } finally {
    loading.value = false
  }
}

async function handleForgotPassword() {
  if (await sendResetEmail()) submitted.value = true
}

async function resendEmail() {
  if (await sendResetEmail()) toast.success('Reset email sent again')
}

function useDifferentEmail() {
  submitted.value = false
  errors.email = ''
}

onMounted(() => {
  ticker = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (ticker) clearInterval(ticker)
})

useHead({
  title: 'Forgot Password',
  meta: [
    { name: 'description', content: 'Reset your CourseAuraHub Academy password' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
