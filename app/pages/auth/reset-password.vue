<template>
  <div
    v-motion="cardMotion"
    class="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-xl short:p-6 light:border-black/10 light:bg-white/90 light:shadow-[0_25px_50px_rgba(0,0,0,0.1),0_0_60px_rgba(16,185,129,0.08)]"
  >
    <!-- Header -->
    <div class="mb-7 text-center short:mb-4">
      <h1 class="mb-2 text-[28px] font-extrabold tracking-[-0.5px] text-slate-100 max-[480px]:text-2xl short:text-2xl light:text-slate-900">Reset Password</h1>
      <p class="text-[15px] leading-normal text-white/60 light:text-slate-500">Enter your new password below</p>
    </div>

    <!-- Form -->
    <form class="mt-6 flex flex-col gap-5 short:mt-4 short:gap-3" @submit.prevent="handleResetPassword">
      <div v-motion="fieldMotion(0)" class="flex flex-col gap-2">
        <label for="password" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">New Password</label>
        <div class="group relative flex items-center">
          <Lock :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            :class="errors.password ? inputErrorClass : inputClass"
            placeholder="Create a strong password"
            autocomplete="new-password"
            required
            :disabled="loading"
          />
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

        <PasswordStrengthMeter :password="form.password" :show="!!form.password" />
      </div>

      <div v-motion="fieldMotion(0.08)" class="flex flex-col gap-2">
        <label for="confirmPassword" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Confirm New Password</label>
        <div class="group relative flex items-center">
          <Lock :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :class="errors.confirmPassword ? inputErrorClass : inputClass"
            placeholder="Confirm your new password"
            autocomplete="new-password"
            required
            :disabled="loading"
          />
          <button
            type="button"
            class="absolute right-3.5 z-10 flex cursor-pointer items-center text-white/40 transition-colors hover:text-emerald-500 light:text-black/40"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Eye v-if="!showConfirmPassword" :size="18" />
            <EyeOff v-else :size="18" />
          </button>
        </div>
        <p v-if="errors.confirmPassword" class="min-h-4 text-xs text-red-500">{{ errors.confirmPassword }}</p>
      </div>

      <button
        type="submit"
        class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] enabled:active:translate-y-0 enabled:active:shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60 short:py-3"
        :disabled="loading || !isFormValid"
        :class="{ 'pointer-events-none': loading }"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <span v-else>Reset Password</span>
      </button>
    </form>

    <!-- Success State -->
    <div v-if="success" v-motion="successMotion" class="mt-7 flex flex-col items-center gap-3 text-center">
      <div class="flex size-18 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/12 text-emerald-400 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-600">
        <CheckCircle :size="48" />
      </div>
      <h2 class="text-xl font-bold text-slate-100 light:text-slate-900">Password Reset Complete</h2>
      <p class="text-sm leading-relaxed text-white/60 light:text-slate-600">
        Your password has been successfully updated. You can now sign in with your new password.
      </p>
      <NuxtLink
        to="/auth/login"
        class="mt-4 flex w-full items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)]"
      >
        Sign In
      </NuxtLink>
    </div>

    <!-- Footer -->
    <p v-if="!success" class="mt-7 text-center text-sm text-white/60 short:mt-4 light:text-slate-500">
      Remember your password?
      <NuxtLink to="/auth/login" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle
} from 'lucide-vue-next'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'

const route = useRoute()

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

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const token = computed(() => route.query.token as string)

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-emerald-500 focus:bg-white/[0.07] focus:ring-[3px] focus:ring-emerald-500/15 disabled:opacity-60 short:py-3 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const inputErrorClass = 'w-full rounded-xl border border-red-500 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none ring-[3px] ring-red-500/15 transition-all duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-red-500/15 disabled:opacity-60 short:py-3 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

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

const successMotion = {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }
}

const isFormValid = computed(() => {
  return form.password.length >= 8 &&
         form.password === form.confirmPassword &&
         token.value
})

function validateForm() {
  let valid = true
  errors.password = ''
  errors.confirmPassword = ''

  if (!token.value) {
    errors.password = 'Invalid or expired reset token'
    return false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
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
  } catch (e: unknown) {
    const message = (e as { response?: { _data?: { message: string } } }).response?._data?.message
      || (e as Error)?.message
      || 'Failed to reset password'
    errors.password = message
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
