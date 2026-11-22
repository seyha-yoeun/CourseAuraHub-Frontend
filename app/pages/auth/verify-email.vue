<template>
  <div>
    <NuxtLink :to="loginLink" :class="authBackLink">
      <ArrowLeft :size="15" aria-hidden="true" /> {{ t('Back to log in') }}
    </NuxtLink>

    <div :class="authIconBadge">
      <MailCheck :size="22" aria-hidden="true" />
    </div>
    <h1 :class="authTitle">{{ t('Check your email') }}</h1>
    <p v-if="emailLocked" :class="authSubtitle">
      {{ t('Enter the {count}-digit code we sent to', { count: codeLength }) }}
      <strong class="font-semibold break-all text-slate-100 light:text-slate-900">{{ form.email }}</strong>
    </p>
    <p v-else :class="authSubtitle">{{ t('Enter your email and the code from your verification email.') }}</p>

    <form :class="[authBodyGap, authForm]" novalidate @submit.prevent="handleVerify">
      <div v-if="pageError" :class="authAlertError" role="alert">
        <AlertCircle :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{{ pageError }}</span>
      </div>

      <div v-if="notice" :class="authAlertSuccess" role="status">
        <CircleCheck :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{{ notice }}</span>
      </div>

      <div v-if="!emailLocked" :class="authField">
        <label for="email" :class="authLabel">{{ t('Email') }}</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          :class="errors.email ? authInputError : authInput"
          placeholder="you@example.com"
          autocomplete="email"
          inputmode="email"
          required
          :disabled="loading"
          :aria-invalid="Boolean(errors.email) || undefined"
          :aria-describedby="errors.email ? 'email-error' : undefined"
        >
        <p v-if="errors.email" id="email-error" :class="authFieldError">{{ errors.email }}</p>
      </div>

      <div :class="authField">
        <span :class="authLabel">{{ t('Verification code') }}</span>
        <OtpCodeInput
          ref="codeInput"
          v-model="form.code"
          :length="codeLength"
          :disabled="loading"
          :invalid="Boolean(errors.code)"
          :autofocus="emailLocked"
          @complete="handleVerify"
        />
        <p v-if="errors.code" :class="authFieldError" role="alert">{{ errors.code }}</p>
        <p v-else :class="authHint">{{ t('The code expires {minutes} minutes after it was sent.', { minutes: codeTtlMinutes }) }}</p>
      </div>

      <button type="submit" :class="[authPrimaryButton, 'mt-1.5']" :disabled="loading" :aria-busy="loading">
        <Loader2 v-if="loading" :size="18" class="animate-spin" aria-hidden="true" />
        <template v-else>
          <span>{{ t('Verify & continue') }}</span>
          <ArrowRight :size="16" aria-hidden="true" />
        </template>
      </button>
    </form>

    <div class="mt-6 flex flex-col gap-2 border-t border-white/8 pt-5 short:mt-4 short:pt-4 light:border-slate-200">
      <p :class="[authHint, 'text-[13.5px]']">
        {{ t('Didn\'t get it? Check your spam folder or') }}
        <button
          type="button"
          :class="[authLink, 'cursor-pointer disabled:cursor-not-allowed disabled:text-white/35 disabled:no-underline light:disabled:text-slate-400']"
          :disabled="resending || cooldown > 0 || loading"
          @click="handleResend"
        >
          <template v-if="resending">{{ t('sending…') }}</template>
          <template v-else-if="cooldown > 0">{{ t('resend in {seconds}s', { seconds: cooldown }) }}</template>
          <template v-else>{{ t('send a new code') }}</template>
        </button>
      </p>
      <p :class="[authHint, 'text-[13.5px]']">
        {{ t('Wrong email?') }}
        <NuxtLink :to="registerLink" :class="authStrongLink" @click="clearPendingVerification()">{{ t('Start over') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import {
  clearPendingVerification,
  getPendingVerification,
  getSafeRedirect,
} from '~/utils/authRedirect'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Loader2,
  MailCheck,
} from 'lucide-vue-next'
import {
  authAlertError,
  authAlertSuccess,
  authBackLink,
  authBodyGap,
  authField,
  authFieldError,
  authForm,
  authHint,
  authIconBadge,
  authInput,
  authInputError,
  authLabel,
  authLink,
  authPrimaryButton,
  authStrongLink,
  authSubtitle,
  authTitle,
} from '~/utils/authUi'
import OtpCodeInput from '~/components/auth/OtpCodeInput.vue'

const { t } = useT()

const route = useRoute()
const auth = useAuth()
const { verifyEmail, resendVerification } = auth
const loading = computed(() => auth.loading)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const form = reactive({
  email: '',
  code: '',
})

const errors = reactive({
  email: '',
  code: '',
})

const codeInput = ref<InstanceType<typeof OtpCodeInput> | null>(null)
const emailLocked = ref(false)
const codeLength = ref(6)
const codeTtlMinutes = ref(10)
const pageError = ref('')
const notice = ref('')
const resending = ref(false)
const resendAvailableAt = ref(0)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined

const cooldown = computed(() => Math.max(0, Math.ceil((resendAvailableAt.value - now.value) / 1000)))

const redirectQuery = computed(() => {
  const redirect = getSafeRedirect(route.query.redirect)
  return redirect ? { redirect } : undefined
})

const registerLink = computed(() => ({ path: '/auth/register', query: redirectQuery.value }))
const loginLink = computed(() => ({ path: '/auth/login', query: redirectQuery.value }))

function validateEmail() {
  errors.email = ''

  if (!form.email.trim()) {
    errors.email = t('Email is required')
    return false
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = t('Please enter a valid email address')
    return false
  }

  return true
}

async function handleVerify() {
  if (loading.value) return

  pageError.value = ''
  notice.value = ''
  errors.code = ''

  if (!validateEmail()) return

  if (form.code.length !== codeLength.value) {
    errors.code = `Enter the ${codeLength.value}-digit code`
    return
  }

  try {
    await verifyEmail(form.email.trim(), form.code)
  } catch (error) {
    const apiError = toApiError(error, t('Email verification failed'))

    if (apiError.fieldErrors.email) errors.email = apiError.fieldErrors.email

    if (apiError.status === 400) {
      errors.code = apiError.fieldErrors.code || apiError.message
      form.code = ''
      codeInput.value?.focus()
    } else if (apiError.status === 429) {
      pageError.value = t('Too many attempts. Please wait a moment and try again.')
    } else if (!Object.keys(apiError.fieldErrors).length) {
      pageError.value = apiError.message
    }
  }
}

async function handleResend() {
  pageError.value = ''
  notice.value = ''
  errors.code = ''

  if (!validateEmail()) return

  resending.value = true

  try {
    const response = await resendVerification(form.email.trim())
    codeLength.value = Number(response?.codeLength) || codeLength.value
    codeTtlMinutes.value = Math.max(1, Math.round((Number(response?.codeExpiresInSeconds) || 600) / 60))
    resendAvailableAt.value = Date.now() + (Number(response?.resendCooldownSeconds) || 60) * 1000
    emailLocked.value = true
    form.code = ''
    notice.value = t('If this account is awaiting verification, a new code is on its way. Earlier codes no longer work.')
    codeInput.value?.focus()
  } catch (error) {
    const apiError = toApiError(error, t('Unable to send a new verification code'))

    pageError.value = apiError.status === 429
      ? t('Too many requests. Please wait a moment before asking for another code.')
      : apiError.message
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  const pending = getPendingVerification()

  if (pending) {
    form.email = pending.email
    codeLength.value = pending.codeLength
    codeTtlMinutes.value = Math.max(1, Math.round(pending.codeExpiresInSeconds / 60))
    resendAvailableAt.value = pending.resendAvailableAt
    emailLocked.value = true
  }

  ticker = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (ticker) clearInterval(ticker)
})

useHead({
  title: t('Verify Email'),
  meta: [
    { name: 'description', content: t('Confirm your email address to finish creating your CourseAuraHub Academy account') }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
