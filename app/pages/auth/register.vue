<template>
  <div
    v-motion="cardMotion"
    class="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-xl short:p-6 light:border-black/10 light:bg-white/90 light:shadow-[0_25px_50px_rgba(0,0,0,0.1),0_0_60px_rgba(16,185,129,0.08)]"
  >
    <!-- Header -->
    <div class="mb-7 text-center short:mb-4">
      <h1 class="mb-2 text-[28px] font-extrabold tracking-[-0.5px] text-slate-100 max-[480px]:text-2xl short:text-2xl light:text-slate-900">Create your account</h1>
      <p class="text-[15px] leading-normal text-white/60 light:text-slate-500">Join CourseAuraHub Academy and start learning today</p>
    </div>

    <!-- Social Login -->
    <SocialLoginButtons
      :loading="loading"
      @click="handleSocialLogin"
    />

    <!-- Registration Form -->
    <form class="mt-6 flex flex-col gap-5 short:mt-4 short:gap-3" @submit.prevent="handleRegister">
      <div v-motion="fieldMotion(0)" class="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
        <div class="flex flex-col gap-2">
          <label for="firstName" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">First Name</label>
          <div class="group relative flex items-center">
            <User :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              :class="errors.firstName ? inputErrorClass : inputClass"
              placeholder="John"
              autocomplete="given-name"
              required
              :disabled="loading"
            />
          </div>
          <p v-if="errors.firstName" class="min-h-4 text-xs text-red-500">{{ errors.firstName }}</p>
        </div>

        <div class="flex flex-col gap-2">
          <label for="lastName" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Last Name</label>
          <div class="group relative flex items-center">
            <User :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              :class="errors.lastName ? inputErrorClass : inputClass"
              placeholder="Doe"
              autocomplete="family-name"
              required
              :disabled="loading"
            />
          </div>
          <p v-if="errors.lastName" class="min-h-4 text-xs text-red-500">{{ errors.lastName }}</p>
        </div>
      </div>

      <div v-motion="fieldMotion(0.06)" class="flex flex-col gap-2">
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
          />
        </div>
        <p v-if="errors.email" class="min-h-4 text-xs text-red-500">{{ errors.email }}</p>
      </div>

      <div v-motion="fieldMotion(0.12)" class="flex flex-col gap-2">
        <label for="password" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Password</label>
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

        <!-- Password Strength Meter -->
        <PasswordStrengthMeter :password="form.password" :show="!!form.password" />
      </div>

      <div v-motion="fieldMotion(0.18)" class="flex flex-col gap-2">
        <label for="confirmPassword" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Confirm Password</label>
        <div class="group relative flex items-center">
          <Lock :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :class="errors.confirmPassword ? inputErrorClass : inputClass"
            placeholder="Confirm your password"
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

      <div v-motion="fieldMotion(0.24)" class="flex flex-col gap-2">
        <label class="flex cursor-pointer select-none items-start gap-2.5">
          <input
            v-model="form.terms"
            type="checkbox"
            class="peer sr-only"
            required
            :disabled="loading"
          />
          <span class="mt-px flex size-5 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] transition-all duration-200 after:-mt-0.5 after:h-2.5 after:w-1.5 after:rotate-45 after:content-[''] peer-checked:border-emerald-500 peer-checked:bg-linear-to-br peer-checked:from-emerald-500 peer-checked:to-emerald-600 peer-checked:after:border-r-2 peer-checked:after:border-b-2 peer-checked:after:border-solid peer-checked:after:border-white peer-focus-visible:ring-[3px] peer-focus-visible:ring-emerald-500/20 light:border-slate-200 light:bg-white" />
          <span class="text-[13px] leading-relaxed text-white/60 light:text-slate-500">
            I agree to the
            <NuxtLink to="/terms" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Privacy Policy</NuxtLink>
          </span>
        </label>
        <p v-if="errors.terms" class="min-h-4 text-xs text-red-500">{{ errors.terms }}</p>
      </div>

      <button
        type="submit"
        class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] enabled:active:translate-y-0 enabled:active:shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60 short:py-3"
        :disabled="loading || !isFormValid"
        :class="{ 'pointer-events-none': loading }"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <span v-else>Create Account</span>
      </button>
    </form>

    <!-- Footer -->
    <p class="mt-7 text-center text-sm text-white/60 short:mt-4 light:text-slate-500">
      Already have an account?
      <NuxtLink to="/auth/login" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-vue-next'
import SocialLoginButtons from '~/components/auth/SocialLoginButtons.vue'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'

const { register, initiateOAuth2, loading: authLoading } = useAuth()

const loading = authLoading

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

const showPassword = ref(false)
const showConfirmPassword = ref(false)

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

const isFormValid = computed(() => {
  return form.firstName.trim() &&
         form.lastName.trim() &&
         form.email.trim() &&
         form.password.length >= 8 &&
         form.password === form.confirmPassword &&
         form.terms
})

function validateForm() {
  let valid = true
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.terms = ''

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
    valid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    valid = false
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

  if (!form.terms) {
    errors.terms = 'You must agree to the terms and privacy policy'
    valid = false
  }

  return valid
}

async function handleRegister() {
  if (!validateForm()) return

  try {
    await register(form.firstName, form.lastName, form.email, form.password)
  } catch (e) {
    // Error is handled in the store
  }
}

function handleSocialLogin(provider: 'google' | 'facebook' | 'github') {
  initiateOAuth2(provider)
}

useHead({
  title: 'Create Account',
  meta: [
    { name: 'description', content: 'Create your CourseAuraHub Academy account - Start learning from expert instructors' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
