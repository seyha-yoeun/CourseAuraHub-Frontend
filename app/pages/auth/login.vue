<template>
  <div
    v-motion="cardMotion"
    class="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-xl short:p-6 light:border-black/10 light:bg-white/90 light:shadow-[0_25px_50px_rgba(0,0,0,0.1),0_0_60px_rgba(16,185,129,0.08)]"
  >
    <!-- Header -->
    <div class="mb-7 text-center short:mb-4">
      <h1 class="mb-2 text-[28px] font-extrabold tracking-[-0.5px] text-slate-100 light:text-slate-900 short:text-2xl">Welcome back</h1>
      <p class="text-[15px] leading-normal text-white/60 light:text-slate-500">Sign in to your CourseAuraHub Academy account</p>
    </div>

    <!-- Social Login -->
    <SocialLoginButtons
      :loading="loading"
      @click="handleSocialLogin"
    />

    <!-- Email/Password Form -->
    <form class="mt-6 flex flex-col gap-5 short:mt-4 short:gap-3" @submit.prevent="handleLogin">
      <div
        v-if="pageError"
        class="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.75 text-[13px] leading-relaxed text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
        role="alert"
      >
        {{ pageError }}
      </div>

      <div
        v-if="needsVerification"
        class="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-[13px] leading-relaxed text-amber-200 light:border-amber-200 light:bg-amber-50 light:text-amber-800"
        role="alert"
      >
        <span>Please verify your email address before signing in. We'll send a fresh code to <strong class="break-all">{{ form.email }}</strong>.</span>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-all duration-200 enabled:hover:shadow-[0_6px_18px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="sendingVerification"
          @click="goToVerification"
        >
          <Loader2 v-if="sendingVerification" :size="15" class="animate-spin" />
          <MailCheck v-else :size="15" />
          <span>Send code &amp; verify</span>
        </button>
      </div>

      <div v-motion="fieldMotion(0)" class="flex flex-col gap-2">
        <label for="email" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Email</label>
        <div class="group relative flex items-center">
          <Mail :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
          <input
            id="email"
            v-model="form.email"
            type="email"
            :class="errors.email ? inputErrorClass : inputClass"
            placeholder="you@example.com"
            autocomplete="email"
            required
            :disabled="loading"
          >
        </div>
        <p v-if="errors.email" class="min-h-4 text-xs text-red-500">{{ errors.email }}</p>
      </div>

      <div v-motion="fieldMotion(0.08)" class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label for="password" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Password</label>
          <NuxtLink to="/auth/forgot-password" class="text-[13px] font-medium text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Forgot password?</NuxtLink>
        </div>
        <div class="group relative flex items-center">
          <Lock :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            :class="errors.password ? inputErrorClass : inputClass"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
            :disabled="loading"
          >
          <button
            type="button"
            class="absolute right-3.5 z-10 flex cursor-pointer items-center text-white/40 transition-colors hover:text-emerald-500 light:text-black/40"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <Eye v-if="!showPassword" :size="18" />
            <EyeOff v-else :size="18" />
          </button>
        </div>
        <p v-if="errors.password" class="min-h-4 text-xs text-red-500">{{ errors.password }}</p>
      </div>

      <div v-motion="fieldMotion(0.16)">
        <label class="flex cursor-pointer select-none items-center gap-2.5">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="peer sr-only"
            :disabled="loading"
          >
          <span class="flex size-5 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] transition-all duration-200 after:-mt-0.5 after:h-2.5 after:w-1.5 after:rotate-45 after:content-[''] peer-checked:border-emerald-500 peer-checked:bg-linear-to-br peer-checked:from-emerald-500 peer-checked:to-emerald-600 peer-checked:after:border-r-2 peer-checked:after:border-b-2 peer-checked:after:border-solid peer-checked:after:border-white peer-focus-visible:ring-[3px] peer-focus-visible:ring-emerald-500/20 light:border-slate-200 light:bg-white" />
          <span class="text-sm text-white/70 light:text-slate-600">Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] enabled:active:translate-y-0 enabled:active:shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60 short:py-3"
        :disabled="loading"
        :class="{ 'pointer-events-none': loading }"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <span v-else>Sign In</span>
      </button>
    </form>

    <!-- Footer -->
    <p class="mt-7 text-center text-sm text-white/60 short:mt-4 light:text-slate-500">
      Don't have an account?
      <NuxtLink :to="registerLink" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Create one</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import { getOAuthErrorMessage, getSafeRedirect } from '~/utils/authRedirect'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
} from 'lucide-vue-next'
import SocialLoginButtons from '~/components/auth/SocialLoginButtons.vue'

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

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-emerald-500 focus:bg-white/[0.07] focus:ring-[3px] focus:ring-emerald-500/15 disabled:opacity-60 short:py-3 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const inputErrorClass = 'w-full rounded-xl border border-red-500 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none ring-[3px] ring-red-500/15 transition-all duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-red-500/15 disabled:opacity-60 short:py-3 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const pageError = ref('')
const showPassword = ref(false)
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
  pageError.value = 'Your session has expired. Please sign in again.'
} else if (oauthError) {
  pageError.value = oauthError
}

onMounted(() => {
  if (auth.initializationError && !pageError.value) {
    pageError.value = auth.initializationError
  }
})

const cardMotion = {
  initial: { opacity: 0, y: 30 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

function fieldMotion(delay = 0) {
  return {
    initial: { opacity: 0, x: -20 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] } }
  }
}

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
  title: 'Sign In',
  meta: [
    { name: 'description', content: 'Sign in to CourseAuraHub Academy - Access your courses and dashboard' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
