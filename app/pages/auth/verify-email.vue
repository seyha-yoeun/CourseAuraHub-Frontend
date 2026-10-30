<template>
  <div
    v-motion="cardMotion"
    class="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-xl short:p-6 light:border-black/10 light:bg-white/90 light:shadow-[0_25px_50px_rgba(0,0,0,0.1),0_0_60px_rgba(16,185,129,0.08)]"
  >
    <!-- Header -->
    <div class="mb-7 flex flex-col items-center text-center short:mb-4">
      <div class="mb-4 flex size-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/12 text-emerald-400 short:hidden light:border-emerald-200 light:bg-emerald-50 light:text-emerald-600">
        <MailCheck :size="28" />
      </div>
      <h1 class="mb-2 text-[28px] font-extrabold tracking-[-0.5px] text-slate-100 max-[480px]:text-2xl short:text-2xl light:text-slate-900">Verify your email</h1>
      <p v-if="emailLocked" class="text-[15px] leading-normal text-white/60 light:text-slate-500">
        Enter the {{ codeLength }}-digit code we sent to
        <strong class="break-all text-slate-100 light:text-slate-900">{{ form.email }}</strong>
      </p>
      <p v-else class="text-[15px] leading-normal text-white/60 light:text-slate-500">
        Enter your email and the code from your verification email
      </p>
    </div>

    <form class="flex flex-col gap-5 short:gap-3" @submit.prevent="handleVerify">
      <div
        v-if="pageError"
        class="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.75 text-[13px] leading-relaxed text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
        role="alert"
      >
        {{ pageError }}
      </div>

      <div
        v-if="notice"
        class="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.75 text-[13px] leading-relaxed text-emerald-300 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700"
        role="status"
      >
        {{ notice }}
      </div>

      <div v-if="!emailLocked" v-motion="fieldMotion(0)" class="flex flex-col gap-2">
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
        <label class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Verification code</label>
        <OtpCodeInput
          ref="codeInput"
          v-model="form.code"
          :length="codeLength"
          :disabled="loading"
          :invalid="Boolean(errors.code)"
          :autofocus="emailLocked"
          @complete="handleVerify"
        />
        <p v-if="errors.code" class="min-h-4 text-xs text-red-500">{{ errors.code }}</p>
        <p v-else class="text-xs text-white/40 light:text-slate-400">The code expires {{ codeTtlMinutes }} minutes after it was sent.</p>
      </div>

      <button
        type="submit"
        class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] enabled:active:translate-y-0 enabled:active:shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60 short:py-3"
        :disabled="loading || !isFormValid"
        :class="{ 'pointer-events-none': loading }"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <span v-else>Verify &amp; Continue</span>
      </button>
    </form>

    <!-- Resend -->
    <p class="mt-6 text-center text-[13px] text-white/45 light:text-slate-400">
      Didn't receive it? Check your spam folder or
      <button
        type="button"
        class="cursor-pointer font-semibold text-emerald-500 transition-colors enabled:hover:text-emerald-400 enabled:hover:underline disabled:cursor-not-allowed disabled:text-white/35 light:text-emerald-600 light:disabled:text-slate-400"
        :disabled="resending || cooldown > 0 || loading"
        @click="handleResend"
      >
        <template v-if="resending">sending…</template>
        <template v-else-if="cooldown > 0">resend in {{ cooldown }}s</template>
        <template v-else>send a new code</template>
      </button>
    </p>

    <!-- Footer -->
    <p class="mt-5 text-center text-sm text-white/60 short:mt-4 light:text-slate-500">
      Wrong email?
      <NuxtLink :to="registerLink" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600" @click="clearPendingVerification()">Start over</NuxtLink>
      or
      <NuxtLink :to="loginLink" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">sign in</NuxtLink>
    </p>
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
  Mail,
  MailCheck,
  Loader2,
} from 'lucide-vue-next'
import OtpCodeInput from '~/components/auth/OtpCodeInput.vue'

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

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-emerald-500 focus:bg-white/[0.07] focus:ring-[3px] focus:ring-emerald-500/15 disabled:opacity-60 short:py-3 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const inputErrorClass = 'w-full rounded-xl border border-red-500 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none ring-[3px] ring-red-500/15 transition-all duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-red-500/15 disabled:opacity-60 short:py-3 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

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

const isFormValid = computed(() => {
  return EMAIL_PATTERN.test(form.email.trim()) && form.code.length === codeLength.value
})

const redirectQuery = computed(() => {
  const redirect = getSafeRedirect(route.query.redirect)
  return redirect ? { redirect } : undefined
})

const registerLink = computed(() => ({ path: '/auth/register', query: redirectQuery.value }))
const loginLink = computed(() => ({ path: '/auth/login', query: redirectQuery.value }))

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

function validateEmail() {
  errors.email = ''

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    return false
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address'
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
    const apiError = toApiError(error, 'Email verification failed')

    if (apiError.fieldErrors.email) errors.email = apiError.fieldErrors.email

    if (apiError.status === 400) {
      errors.code = apiError.fieldErrors.code || apiError.message
      form.code = ''
      codeInput.value?.focus()
    } else if (apiError.status === 429) {
      pageError.value = 'Too many attempts. Please wait a moment and try again.'
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
    notice.value = 'If this account is awaiting verification, a new code is on its way. Earlier codes no longer work.'
    codeInput.value?.focus()
  } catch (error) {
    const apiError = toApiError(error, 'Unable to send a new verification code')

    pageError.value = apiError.status === 429
      ? 'Too many requests. Please wait a moment before asking for another code.'
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
  title: 'Verify Email',
  meta: [
    { name: 'description', content: 'Confirm your email address to finish creating your CourseAuraHub Academy account' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
