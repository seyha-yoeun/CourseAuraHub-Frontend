<template>
  <div>
    <NuxtLink :to="loginLink" :class="authBackLink">
      <ArrowLeft :size="15" aria-hidden="true" /> {{ t('Back to log in') }}
    </NuxtLink>

    <!-- Expired challenge -->
    <div v-if="challengeExpired">
      <div :class="authIconBadgeDanger">
        <TimerOff :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">{{ t('Sign-in timed out') }}</h1>
      <p :class="authSubtitle" role="alert">{{ pageError }}</p>
      <NuxtLink :to="loginLink" :class="[authPrimaryButton, 'mt-7 short:mt-5']">{{ t('Log in again') }}</NuxtLink>
    </div>

    <template v-else>
      <div :class="authIconBadge">
        <KeyRound v-if="useRecoveryCode" :size="22" aria-hidden="true" />
        <ShieldCheck v-else :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">{{ useRecoveryCode ? t('Use a recovery code') : t('Two-factor verification') }}</h1>
      <p :class="authSubtitle">
        <template v-if="useRecoveryCode">{{ t('Enter one of the recovery codes you saved when you turned on two-factor authentication.') }}</template>
        <template v-else>{{ t('Open your authenticator app and enter the 6-digit code for CourseAuraHub.') }}</template>
      </p>

      <form :class="[authBodyGap, authForm]" novalidate @submit.prevent="handleVerify">
        <div v-if="pageError" :class="authAlertError" role="alert">
          <AlertCircle :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{{ pageError }}</span>
        </div>

        <div v-if="useRecoveryCode" :class="authField">
          <label for="recoveryCode" :class="authLabel">{{ t('Recovery code') }}</label>
          <input
            id="recoveryCode"
            ref="recoveryInput"
            v-model="form.recoveryCode"
            type="text"
            :class="[errors.code ? authInputError : authInput, 'font-mono tracking-wider']"
            placeholder="xxxxx-xxxxx"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            :disabled="loading"
            :aria-invalid="Boolean(errors.code) || undefined"
            aria-describedby="code-help"
          >
          <p v-if="errors.code" id="code-help" :class="authFieldError">{{ errors.code }}</p>
          <p v-else id="code-help" :class="authHint">{{ t('Each recovery code works only once.') }}</p>
        </div>

        <div v-else :class="authField">
          <span :class="authLabel">{{ t('Authentication code') }}</span>
          <OtpCodeInput
            ref="codeInput"
            v-model="form.code"
            :label="t('Authentication code')"
            :disabled="loading"
            :invalid="Boolean(errors.code)"
            @complete="handleVerify"
          />
          <p v-if="errors.code" :class="authFieldError" role="alert">{{ errors.code }}</p>
          <p v-else :class="authHint">{{ t('Codes refresh every 30 seconds. You can paste the whole code.') }}</p>
        </div>

        <button type="submit" :class="[authPrimaryButton, 'mt-1.5']" :disabled="loading" :aria-busy="loading">
          <Loader2 v-if="loading" :size="18" class="animate-spin" aria-hidden="true" />
          <span v-else>{{ t('Verify & log in') }}</span>
        </button>
      </form>

      <div class="mt-6 border-t border-white/8 pt-5 short:mt-4 short:pt-4 light:border-slate-200">
        <button type="button" :class="[authLink, 'cursor-pointer text-[13.5px]']" :disabled="loading" @click="toggleMethod">
          {{ useRecoveryCode ? t('Use your authenticator app instead') : t('Lost your device? Use a recovery code') }}
        </button>
        <p :class="[authHint, 'mt-2']">
          {{ t('Not you?') }}
          <NuxtLink :to="loginLink" :class="authStrongLink">{{ t('Log in with a different account') }}</NuxtLink>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import { getSafeRedirect } from '~/utils/authRedirect'
import {
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Loader2,
  ShieldCheck,
  TimerOff,
} from 'lucide-vue-next'
import {
  authAlertError,
  authBackLink,
  authBodyGap,
  authField,
  authFieldError,
  authForm,
  authHint,
  authIconBadge,
  authIconBadgeDanger,
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
const { verifyMfa } = auth
const loading = computed(() => auth.loading)

const form = reactive({
  code: '',
  recoveryCode: '',
})

const errors = reactive({
  code: '',
})

const codeInput = ref<InstanceType<typeof OtpCodeInput> | null>(null)
const recoveryInput = ref<HTMLInputElement | null>(null)
const useRecoveryCode = ref(false)
const challengeExpired = ref(false)
const pageError = ref('')

const loginLink = computed(() => {
  const redirect = getSafeRedirect(route.query.redirect)
  return redirect
    ? { path: '/auth/login', query: { redirect } }
    : '/auth/login'
})

const isFormValid = computed(() => {
  return useRecoveryCode.value
    ? form.recoveryCode.trim().length >= 6
    : form.code.length === 6
})

async function toggleMethod() {
  useRecoveryCode.value = !useRecoveryCode.value
  errors.code = ''
  pageError.value = ''
  form.code = ''
  form.recoveryCode = ''

  await nextTick()
  if (useRecoveryCode.value) recoveryInput.value?.focus()
  else codeInput.value?.focus()
}

async function handleVerify() {
  if (loading.value) return

  errors.code = ''
  pageError.value = ''

  if (!isFormValid.value) {
    errors.code = useRecoveryCode.value
      ? t('Enter one of your recovery codes')
      : t('Enter the 6-digit code from your authenticator app')
    return
  }

  try {
    await verifyMfa(useRecoveryCode.value
      ? { recoveryCode: form.recoveryCode.trim() }
      : { code: form.code })
  } catch (error) {
    const apiError = toApiError(error, t('Two-factor verification failed'))

    if (apiError.code === 'MFA_CHALLENGE_EXPIRED') {
      challengeExpired.value = true
      pageError.value = apiError.message
    } else if (apiError.status === 400) {
      errors.code = apiError.fieldErrors.code || apiError.message
      form.code = ''
      codeInput.value?.focus()
    } else if (apiError.status === 429) {
      pageError.value = t('Too many attempts. Please wait a moment and try again.')
    } else {
      // Locked or disabled accounts cannot finish signing in with this challenge.
      pageError.value = apiError.message
      challengeExpired.value = apiError.status === 401 || apiError.status === 403
    }
  }
}

useHead({
  title: t('Two-Factor Sign In'),
  meta: [
    { name: 'description', content: t('Confirm your sign-in to CourseAuraHub Academy with your authenticator app') }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
