<template>
  <div>
    <Transition name="auth-fade">
      <button
        v-if="step === 2"
        type="button"
        class="mb-3 inline-flex cursor-pointer items-center gap-1 rounded-sm text-[13px] font-medium text-white/55 transition-colors hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 light:text-slate-500 light:hover:text-slate-900"
        @click="goToDetailsStep"
      >
        <ArrowLeft :size="14" aria-hidden="true" /> {{ t('Back') }}
      </button>
    </Transition>
    <h1 :class="authTitle">{{ t('Create your account') }}</h1>

    <!-- Progress: two short steps keep the form inside one screen -->
    <div class="mt-3 flex items-center gap-3 short:mt-2">
      <div class="flex flex-1 gap-1.5" aria-hidden="true">
        <span class="h-1 flex-1 rounded-full bg-brand-400 light:bg-brand-600" />
        <span
          class="h-1 flex-1 rounded-full transition-colors duration-300"
          :class="step === 2 ? 'bg-brand-400 light:bg-brand-600' : 'bg-white/10 light:bg-slate-200'"
        />
      </div>
      <span class="shrink-0 text-[12px] font-medium text-white/50 light:text-slate-500" aria-live="polite">
        {{ t('Step {step} of 2', { step }) }} · {{ step === 1 ? t('Your details') : t('Secure your account') }}
      </span>
    </div>

    <div v-if="referralCode" :class="[authAlertSuccess, 'mt-4 py-2.5 short:mt-3']">
      <Gift :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{{ t('Invited by a friend: code') }} <span class="font-mono font-bold">{{ referralCode }}</span> {{ t('is applied once you\'re signed in.') }}</span>
    </div>

    <div v-if="pageError" :class="[authAlertError, 'mt-4 short:mt-3']" role="alert">
      <AlertCircle :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{{ pageError }}</span>
    </div>

    <div class="relative">
      <Transition :name="step === 2 ? 'auth-slide' : 'auth-slide-back'">
        <!-- Step 1: who you are -->
        <div v-if="step === 1" key="details">
          <p :class="authSubtitle">{{ t('Free to join, and it takes less than a minute.') }}</p>

          <div :class="authBodyGap">
            <SocialLoginButtons :loading="loading" :action-label="t('Sign up')" @click="handleSocialLogin" />
          </div>

          <form :class="authForm" novalidate @submit.prevent="goToSecurityStep">
            <div class="grid grid-cols-2 gap-3">
              <div :class="[authField, 'min-w-0']">
                <label for="firstName" :class="authLabel">{{ t('First name') }}</label>
                <input
                  id="firstName"
                  ref="firstNameInput"
                  v-model="form.firstName"
                  type="text"
                  :class="errors.firstName ? authInputError : authInput"
                  :placeholder="t('Maya')"
                  autocomplete="given-name"
                  required
                  :disabled="loading"
                  :aria-invalid="Boolean(errors.firstName) || undefined"
                  :aria-describedby="errors.firstName ? 'firstName-error' : undefined"
                >
                <p v-if="errors.firstName" id="firstName-error" :class="authFieldError">{{ errors.firstName }}</p>
              </div>

              <div :class="[authField, 'min-w-0']">
                <label for="lastName" :class="authLabel">{{ t('Last name') }}</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  :class="errors.lastName ? authInputError : authInput"
                  :placeholder="t('Chen')"
                  autocomplete="family-name"
                  required
                  :disabled="loading"
                  :aria-invalid="Boolean(errors.lastName) || undefined"
                  :aria-describedby="errors.lastName ? 'lastName-error' : undefined"
                >
                <p v-if="errors.lastName" id="lastName-error" :class="authFieldError">{{ errors.lastName }}</p>
              </div>
            </div>

            <div :class="authField">
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

            <button type="submit" :class="[authPrimaryButton, 'mt-1']" :disabled="loading">
              <span>{{ t('Continue') }}</span>
              <ArrowRight :size="16" aria-hidden="true" />
            </button>
          </form>
        </div>

        <!-- Step 2: password + consent -->
        <div v-else key="security">
          <p :class="[authSubtitle, 'truncate']">
            {{ t('Signing up as') }} <strong class="font-semibold text-slate-100 light:text-slate-900">{{ form.email.trim() }}</strong>
          </p>

          <form :class="[authBodyGap, authForm]" novalidate @submit.prevent="handleRegister">
            <!-- Lets password managers save the new credentials against this email -->
            <input type="email" :value="form.email.trim()" autocomplete="username" class="sr-only" tabindex="-1" aria-hidden="true" readonly>

            <div :class="authField">
              <label for="password" :class="authLabel">{{ t('Password') }}</label>
              <PasswordInput
                id="password"
                ref="passwordInput"
                v-model="form.password"
                :placeholder="t('Create a strong password')"
                autocomplete="new-password"
                :disabled="loading"
                :invalid="Boolean(errors.password)"
                :describedby="errors.password ? 'password-error password-requirements' : 'password-requirements'"
              />
              <p v-if="errors.password" id="password-error" :class="authFieldError">{{ errors.password }}</p>
              <PasswordStrengthMeter id="password-requirements" :password="form.password" :flag-unmet="Boolean(errors.password)" />
            </div>

            <div :class="authField">
              <label for="confirmPassword" :class="authLabel">{{ t('Confirm password') }}</label>
              <PasswordInput
                id="confirmPassword"
                ref="confirmPasswordInput"
                v-model="form.confirmPassword"
                :placeholder="t('Re-enter your password')"
                autocomplete="new-password"
                :disabled="loading"
                :invalid="Boolean(errors.confirmPassword)"
                :describedby="errors.confirmPassword ? 'confirmPassword-error' : undefined"
              />
              <p v-if="errors.confirmPassword" id="confirmPassword-error" :class="authFieldError">{{ errors.confirmPassword }}</p>
              <p v-else-if="passwordsMatch" class="flex items-center gap-1.5 text-[12.5px] text-brand-400 light:text-brand-700">
                <Check :size="13" aria-hidden="true" /> {{ t('Passwords match') }}
              </p>
            </div>

            <div :class="authField">
              <label class="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-white/70 select-none light:text-slate-600">
                <input
                  ref="termsCheckbox"
                  v-model="form.terms"
                  type="checkbox"
                  :class="[authCheckbox, 'mt-px rounded-sm', errors.terms && 'outline-2 outline-offset-2 outline-rose-400 light:outline-rose-500']"
                  required
                  :disabled="loading"
                  :aria-invalid="Boolean(errors.terms) || undefined"
                  :aria-describedby="errors.terms ? 'terms-error' : undefined"
                >
                <span>
                  {{ t('I agree to the') }}
                  <NuxtLink to="/terms" target="_blank" :class="authLink">{{ t('Terms of Service') }}</NuxtLink>
                  {{ t('and') }}
                  <NuxtLink to="/privacy" target="_blank" :class="authLink">{{ t('Privacy Policy') }}</NuxtLink>
                </span>
              </label>
              <p v-if="errors.terms" id="terms-error" :class="authFieldError">{{ errors.terms }}</p>
            </div>

            <!-- Never greyed out: pressing it early explains what's missing (see handleRegister).
                 While submitting it stays full width and ignores further presses. -->
            <button type="submit" :class="[authPrimaryButton, 'mt-1']" :aria-disabled="loading || undefined" :aria-busy="loading">
              <template v-if="loading">
                <Loader2 :size="18" class="animate-spin" aria-hidden="true" />
                <span>{{ t('Creating account…') }}</span>
              </template>
              <template v-else>
                <span>{{ t('Create account') }}</span>
                <ArrowRight :size="16" aria-hidden="true" />
              </template>
            </button>
          </form>
        </div>
      </Transition>
    </div>

    <p :class="[authFooterText, 'mt-6 short:mt-4']">
      {{ t('Already have an account?') }}
      <NuxtLink :to="loginLink" :class="authStrongLink">{{ t('Log in') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import { getOAuthErrorMessage, getSafeRedirect } from '~/utils/authRedirect'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Gift, Loader2 } from 'lucide-vue-next'
import SocialLoginButtons from '~/components/auth/SocialLoginButtons.vue'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import {
  authAlertError,
  authAlertSuccess,
  authBodyGap,
  authCheckbox,
  authField,
  authFieldError,
  authFooterText,
  authForm,
  authInput,
  authInputError,
  authLabel,
  authLink,
  authPrimaryButton,
  authStrongLink,
  authSubtitle,
  authTitle,
} from '~/utils/authUi'
import { useReferral } from '~/composables/useReferral'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'

const { t } = useT()

const route = useRoute()
const auth = useAuth()
const { register, initiateOAuth2 } = auth
const loading = computed(() => auth.loading)
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const step = ref<1 | 2>(1)
const firstNameInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<InstanceType<typeof PasswordInput> | null>(null)
const confirmPasswordInput = ref<InstanceType<typeof PasswordInput> | null>(null)
const termsCheckbox = ref<HTMLInputElement | null>(null)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: ''
})

const pageError = ref('')

const loginLink = computed(() => {
  const redirect = getSafeRedirect(route.query.redirect)
  return redirect
    ? { path: '/auth/login', query: { redirect } }
    : '/auth/login'
})

const oauthError = getOAuthErrorMessage(route.query.error)
// Shared invite links carry ?ref=CODE; it's claimed after sign-up by the referral plugin
const referralCode = ref<string | null>(null)
onMounted(() => {
  const referral = useReferral()
  referralCode.value = referral.rememberCode(route.query.ref) ?? referral.pendingCode()
})

if (oauthError) {
  pageError.value = oauthError
}

// Positive feedback once the confirmation matches a password that meets the rules.
const passwordsMatch = computed(() => {
  return Boolean(form.confirmPassword)
    && form.password === form.confirmPassword
    && PASSWORD_PATTERN.test(form.password)
})

function validateDetails() {
  let valid = true
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''

  if (!form.firstName.trim()) {
    errors.firstName = t('First name is required')
    valid = false
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = t('At least 2 characters')
    valid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = t('Last name is required')
    valid = false
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = t('At least 2 characters')
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = t('Email is required')
    valid = false
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = t('Please enter a valid email address')
    valid = false
  }

  return valid
}

function validateSecurity() {
  let valid = true
  errors.password = ''
  errors.confirmPassword = ''
  errors.terms = ''

  if (!form.password) {
    errors.password = t('Password is required')
    valid = false
  } else if (!PASSWORD_PATTERN.test(form.password)) {
    errors.password = t('Your password doesn\'t meet the rules marked below yet')
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = t('Please confirm your password')
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('Passwords do not match')
    valid = false
  }

  if (!form.terms) {
    errors.terms = t('You must agree to the terms and privacy policy')
    valid = false
  }

  return valid
}

async function goToSecurityStep() {
  pageError.value = ''
  if (!validateDetails()) return

  step.value = 2
  await nextTick()
  passwordInput.value?.focus()
}

async function goToDetailsStep() {
  step.value = 1
  await nextTick()
  firstNameInput.value?.focus()
}

// Move focus to the first thing that still needs attention so the error is never off-screen.
function focusFirstSecurityError() {
  if (errors.password) passwordInput.value?.focus()
  else if (errors.confirmPassword) confirmPasswordInput.value?.focus()
  else if (errors.terms) {
    termsCheckbox.value?.focus()
    termsCheckbox.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

// Clear an error as soon as the user fixes it, instead of waiting for the next submit.
watch(() => form.password, (value) => {
  if (errors.password && PASSWORD_PATTERN.test(value)) errors.password = ''
})
watch(() => form.confirmPassword, (value) => {
  if (errors.confirmPassword && value && value === form.password) errors.confirmPassword = ''
})
watch(() => form.terms, (checked) => {
  if (checked) errors.terms = ''
})

async function handleRegister() {
  // Guards double submits: the button stays clickable-looking while loading.
  if (loading.value) return

  pageError.value = ''
  // Step 1 was validated on Continue; re-check so a stale step can never submit bad details.
  if (!validateDetails()) {
    step.value = 1
    return
  }
  if (!validateSecurity()) {
    focusFirstSecurityError()
    return
  }

  try {
    await register(form.firstName, form.lastName, form.email, form.password)
  } catch (error) {
    const apiError = toApiError(error, t('Registration failed'))

    if (apiError.fieldErrors.firstName) errors.firstName = apiError.fieldErrors.firstName
    if (apiError.fieldErrors.lastName) errors.lastName = apiError.fieldErrors.lastName
    if (apiError.fieldErrors.email) errors.email = apiError.fieldErrors.email
    if (apiError.fieldErrors.password) errors.password = apiError.fieldErrors.password

    // Send the user back to where the problem is.
    if (errors.firstName || errors.lastName || errors.email) step.value = 1

    if (apiError.status === 429) {
      pageError.value = t('Too many registration attempts. Please wait a moment and try again.')
    } else if (!Object.keys(apiError.fieldErrors).length) {
      pageError.value = apiError.message
    }
  }
}

function handleSocialLogin(provider: 'google' | 'facebook' | 'github') {
  initiateOAuth2(provider)
}

useHead({
  title: t('Create Account'),
  meta: [
    { name: 'description', content: t('Create your CourseAuraHub Academy account - Start learning from expert instructors') }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
