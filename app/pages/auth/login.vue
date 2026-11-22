<template>
  <div>
    <h1 :class="authTitle">Welcome back</h1>
    <p :class="authSubtitle">Log in to continue your courses and track your progress.</p>

    <div :class="authBodyGap">
      <SocialLoginButtons :loading="loading" action-label="Log in" @click="handleSocialLogin" />
    </div>

    <form :class="authForm" novalidate @submit.prevent="handleLogin">
      <div v-if="pageError" :class="authAlertError" role="alert">
        <AlertCircle :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{{ pageError }}</span>
      </div>

      <div v-if="needsVerification" :class="[authAlertWarning, 'flex-col gap-3']" role="alert">
        <span>Please verify your email address before logging in. We'll send a fresh code to <strong class="break-all">{{ form.email }}</strong>.</span>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg bg-amber-300 px-3 py-1.5 text-[13px] font-semibold text-amber-950 transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 disabled:cursor-not-allowed disabled:opacity-60 light:bg-amber-600 light:text-white light:hover:bg-amber-700"
          :disabled="sendingVerification"
          @click="goToVerification"
        >
          <Loader2 v-if="sendingVerification" :size="14" class="animate-spin" aria-hidden="true" />
          <MailCheck v-else :size="14" aria-hidden="true" />
          <span>Send code &amp; verify</span>
        </button>
      </div>

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
          required
          :disabled="loading"
          :aria-invalid="Boolean(errors.email) || undefined"
          :aria-describedby="errors.email ? 'email-error' : undefined"
        >
        <p v-if="errors.email" id="email-error" :class="authFieldError">{{ errors.email }}</p>
      </div>

      <div :class="authField">
        <div class="flex items-center justify-between gap-3">
          <label for="password" :class="authLabel">Password</label>
          <NuxtLink to="/auth/forgot-password" :class="[authLink, 'text-[13px]']">Forgot password?</NuxtLink>
        </div>
        <PasswordInput
          id="password"
          v-model="form.password"
          placeholder="Enter your password"
          autocomplete="current-password"
          :disabled="loading"
          :invalid="Boolean(errors.password)"
          :describedby="errors.password ? 'password-error' : undefined"
        />
        <p v-if="errors.password" id="password-error" :class="authFieldError">{{ errors.password }}</p>
      </div>

      <label class="flex w-fit cursor-pointer items-center gap-2.5 text-[13.5px] text-white/70 select-none light:text-slate-600">
        <input v-model="form.rememberMe" type="checkbox" :class="authCheckbox" :disabled="loading">
        Keep me logged in for 30 days
      </label>

      <button type="submit" :class="authPrimaryButton" :aria-disabled="loading || undefined" :aria-busy="loading">
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" aria-hidden="true" />
          <span>Logging in…</span>
        </template>
        <template v-else>
          <span>Log in</span>
          <ArrowRight :size="16" aria-hidden="true" />
        </template>
      </button>
    </form>

    <p :class="[authFooterText, 'mt-6 short:mt-4']">
      New to CourseAuraHub?
      <NuxtLink :to="registerLink" :class="authStrongLink">Create a free account</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import { getOAuthErrorMessage, getSafeRedirect } from '~/utils/authRedirect'
import { AlertCircle, ArrowRight, Loader2, MailCheck } from 'lucide-vue-next'
import SocialLoginButtons from '~/components/auth/SocialLoginButtons.vue'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import {
  authAlertError,
  authAlertWarning,
  authBodyGap,
  authCheckbox,
  authField,
  authFieldError,
  authForm,
  authFooterText,
  authInput,
  authInputError,
  authLabel,
  authLink,
  authPrimaryButton,
  authStrongLink,
  authSubtitle,
  authTitle,
} from '~/utils/authUi'

const route = useRoute()
const auth = useAuth()
const { login, initiateOAuth2, resendVerification } = auth
const router = useRouter()
const loading = computed(() => auth.loading)

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  email: '',
  password: '',
})

const pageError = ref('')
const needsVerification = ref(false)
const sendingVerification = ref(false)

const registerLink = computed(() => {
  const redirect = getSafeRedirect(route.query.redirect)
  return redirect
    ? { path: '/auth/register', query: { redirect } }
    : '/auth/register'
})

const oauthError = getOAuthErrorMessage(route.query.error)

if (route.query.session === 'expired') {
  pageError.value = 'Your session has expired. Please log in again.'
} else if (oauthError) {
  pageError.value = oauthError
}

onMounted(() => {
  if (auth.initializationError && !pageError.value) {
    pageError.value = auth.initializationError
  }
})

function validateForm() {
  let valid = true
  errors.email = ''
  errors.password = ''
  pageError.value = ''
  needsVerification.value = false

  if (!form.email) {
    errors.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  }

  return valid
}

async function handleLogin() {
  // Guards double submits: the button stays clickable-looking while loading.
  if (loading.value) return
  if (!validateForm()) return

  try {
    await login(form.email, form.password, form.rememberMe)
  } catch (error) {
    const apiError = toApiError(error, 'Login failed')

    if (apiError.fieldErrors.email) errors.email = apiError.fieldErrors.email
    if (apiError.fieldErrors.password) errors.password = apiError.fieldErrors.password

    if (apiError.code === 'EMAIL_NOT_VERIFIED') {
      needsVerification.value = true
    } else if (apiError.status === 401) {
      // Generic for wrong credentials; explains temporary lockouts.
      pageError.value = apiError.message || 'Invalid email or password. Please try again.'
    } else if (apiError.status === 403) {
      pageError.value = apiError.message
    } else if (apiError.status === 429) {
      pageError.value = 'Too many sign-in attempts. Please wait a moment and try again.'
    } else if (!Object.keys(apiError.fieldErrors).length) {
      pageError.value = apiError.message
    }
  }
}

async function goToVerification() {
  sendingVerification.value = true

  try {
    await resendVerification(form.email.trim())
    const redirect = getSafeRedirect(route.query.redirect)
    await router.push({ path: '/auth/verify-email', query: redirect ? { redirect } : undefined })
  } catch (error) {
    const apiError = toApiError(error, 'Unable to send a verification code')
    needsVerification.value = false
    pageError.value = apiError.status === 429
      ? 'Too many requests. Please wait a moment before asking for another code.'
      : apiError.message
  } finally {
    sendingVerification.value = false
  }
}

function handleSocialLogin(provider: 'google' | 'facebook' | 'github') {
  initiateOAuth2(provider)
}

useHead({
  title: 'Log In',
  meta: [
    { name: 'description', content: 'Sign in to CourseAuraHub Academy - Access your courses and dashboard' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
