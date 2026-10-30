<template>
  <div
    v-motion="cardMotion"
    class="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-xl short:p-6 light:border-black/10 light:bg-white/90 light:shadow-[0_25px_50px_rgba(0,0,0,0.1),0_0_60px_rgba(16,185,129,0.08)]"
  >
    <!-- Header -->
    <div class="mb-7 text-center short:mb-4">
      <h1 class="mb-2 text-[28px] font-extrabold tracking-[-0.5px] text-slate-100 max-[480px]:text-2xl short:text-2xl light:text-slate-900">Forgot Password</h1>
      <p class="text-[15px] leading-normal text-white/60 light:text-slate-500">Enter your email and we'll send you a reset link</p>
    </div>

    <!-- Form -->
    <form class="mt-6 flex flex-col gap-5 short:mt-4 short:gap-3" @submit.prevent="handleForgotPassword">
      <div v-motion="fieldMotion" class="flex flex-col gap-2">
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
            :disabled="loading || submitted"
          >
        </div>
        <p v-if="errors.email" class="min-h-4 text-xs text-red-500">{{ errors.email }}</p>
      </div>

      <button
        type="submit"
        class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] enabled:active:translate-y-0 enabled:active:shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60 short:py-3"
        :disabled="loading || submitted"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <span v-else-if="submitted">Email Sent</span>
        <span v-else>Send Reset Link</span>
      </button>
    </form>

    <!-- Success State -->
    <div v-if="submitted" v-motion="successMotion" class="mt-7 flex flex-col items-center gap-3 text-center">
      <div class="flex size-18 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/12 text-emerald-400 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-600">
        <MailCheck :size="48" />
      </div>
      <h2 class="text-xl font-bold text-slate-100 light:text-slate-900">Check Your Inbox</h2>
      <p class="text-sm leading-relaxed text-white/60 light:text-slate-600">
        If an account exists for <strong class="break-all">{{ form.email }}</strong>, a password reset link is on its way.
        The link expires in 30 minutes and works once.
      </p>
      <p class="text-[13px] text-white/45 light:text-slate-400">
        Didn't receive it? Check your spam folder or
        <button
          type="button"
          class="cursor-pointer font-semibold text-emerald-500 transition-colors enabled:hover:text-emerald-400 enabled:hover:underline disabled:cursor-not-allowed disabled:text-white/35 light:text-emerald-600 light:disabled:text-slate-400"
          :disabled="loading || cooldown > 0"
          @click="resendEmail"
        >
          {{ cooldown > 0 ? `resend in ${cooldown}s` : 'resend the email' }}
        </button>
      </p>
    </div>

    <!-- Footer -->
    <p class="mt-7 text-center text-sm text-white/60 short:mt-4 light:text-slate-500">
      Remember your password?
      <NuxtLink to="/auth/login" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, reactive } from 'vue'
import { toApiError } from '~/utils/apiError'
import {
  Mail,
  Loader2,
  MailCheck
} from 'lucide-vue-next'

const RESEND_COOLDOWN_MS = 60 * 1000

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

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-emerald-500 focus:bg-white/[0.07] focus:ring-[3px] focus:ring-emerald-500/15 disabled:opacity-60 short:py-3 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const inputErrorClass = 'w-full rounded-xl border border-red-500 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none ring-[3px] ring-red-500/15 transition-all duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-red-500/15 disabled:opacity-60 short:py-3 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const cardMotion = {
  initial: { opacity: 0, y: 30 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const fieldMotion = {
  initial: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] } }
}

const successMotion = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }
}

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

async function handleForgotPassword() {
  if (!validateEmail()) return

  loading.value = true
  try {
    // Call the forgot password API endpoint
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: form.email.trim() }
    })
    submitted.value = true
    resendAvailableAt.value = Date.now() + RESEND_COOLDOWN_MS
  } catch (error) {
    const apiError = toApiError(error, 'Failed to send reset email')
    errors.email = apiError.status === 429
      ? 'Too many requests. Please wait a moment and try again.'
      : apiError.fieldErrors.email || apiError.message
  } finally {
    loading.value = false
  }
}

function resendEmail() {
  submitted.value = false
  handleForgotPassword()
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
