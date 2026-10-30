<template>
  <div
    v-motion="cardMotion"
    class="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-xl short:p-6 light:border-black/10 light:bg-white/90 light:shadow-[0_25px_50px_rgba(0,0,0,0.1),0_0_60px_rgba(16,185,129,0.08)]"
  >
    <!-- Header -->
    <div class="mb-7 flex flex-col items-center text-center short:mb-4">
      <div class="mb-4 flex size-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/12 text-emerald-400 short:hidden light:border-emerald-200 light:bg-emerald-50 light:text-emerald-600">
        <ShieldCheck :size="28" />
      </div>
      <h1 class="mb-2 text-[28px] font-extrabold tracking-[-0.5px] text-slate-100 max-[480px]:text-2xl short:text-2xl light:text-slate-900">Two-factor sign in</h1>
      <p class="text-[15px] leading-normal text-white/60 light:text-slate-500">
        <template v-if="useRecoveryCode">Enter one of the recovery codes you saved when you turned on two-factor authentication</template>
        <template v-else>Open your authenticator app and enter the 6-digit code for CourseAuraHub</template>
      </p>
    </div>

    <!-- Expired challenge -->
    <div v-if="challengeExpired" class="flex flex-col items-center gap-4 text-center">
      <div
        class="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.75 text-[13px] leading-relaxed text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
        role="alert"
      >
        {{ pageError }}
      </div>
      <NuxtLink
        :to="loginLink"
        class="flex w-full items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] short:py-3"
      >
        Back to Sign In
      </NuxtLink>
    </div>

    <form v-else class="flex flex-col gap-5 short:gap-3" @submit.prevent="handleVerify">
      <div
        v-if="pageError"
        class="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.75 text-[13px] leading-relaxed text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700"
        role="alert"
      >
        {{ pageError }}
      </div>

      <div v-if="useRecoveryCode" v-motion="fieldMotion(0)" class="flex flex-col gap-2">
        <label for="recoveryCode" class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Recovery code</label>
        <div class="group relative flex items-center">
          <KeyRound :size="18" class="pointer-events-none absolute left-3.5 z-10 text-white/40 transition-colors group-focus-within:text-emerald-500 light:text-black/40" />
          <input
            id="recoveryCode"
            ref="recoveryInput"
            v-model="form.recoveryCode"
            type="text"
            :class="[errors.code ? inputErrorClass : inputClass, 'font-mono tracking-wider']"
            placeholder="xxxxx-xxxxx"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            :disabled="loading"
          >
        </div>
        <p v-if="errors.code" class="min-h-4 text-xs text-red-500">{{ errors.code }}</p>
        <p v-else class="text-xs text-white/40 light:text-slate-400">Each recovery code works only once.</p>
      </div>

      <div v-else v-motion="fieldMotion(0)" class="flex flex-col gap-2">
        <label class="text-[13px] font-semibold text-slate-200 light:text-slate-700">Authentication code</label>
        <OtpCodeInput
          ref="codeInput"
          v-model="form.code"
          label="Authentication code"
          :disabled="loading"
          :invalid="Boolean(errors.code)"
          @complete="handleVerify"
        />
        <p v-if="errors.code" class="min-h-4 text-xs text-red-500">{{ errors.code }}</p>
      </div>

      <button
        type="submit"
        class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-4 text-[15px] font-semibold text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] enabled:active:translate-y-0 enabled:active:shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60 short:py-3"
        :disabled="loading || !isFormValid"
        :class="{ 'pointer-events-none': loading }"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <span v-else>Verify &amp; Sign In</span>
      </button>

      <button
        type="button"
        class="cursor-pointer text-center text-[13px] font-semibold text-emerald-500 transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600"
        :disabled="loading"
        @click="toggleMethod"
      >
        {{ useRecoveryCode ? 'Use your authenticator app instead' : 'Lost your device? Use a recovery code' }}
      </button>
    </form>

    <!-- Footer -->
    <p v-if="!challengeExpired" class="mt-7 text-center text-sm text-white/60 short:mt-4 light:text-slate-500">
      Not you?
      <NuxtLink :to="loginLink" class="font-semibold text-emerald-500 no-underline transition-colors hover:text-emerald-400 hover:underline light:text-emerald-600">Sign in with a different account</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import { getSafeRedirect } from '~/utils/authRedirect'
import {
  KeyRound,
  Loader2,
  ShieldCheck,
} from 'lucide-vue-next'
import OtpCodeInput from '~/components/auth/OtpCodeInput.vue'

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

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-emerald-500 focus:bg-white/[0.07] focus:ring-[3px] focus:ring-emerald-500/15 disabled:opacity-60 short:py-3 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const inputErrorClass = 'w-full rounded-xl border border-red-500 bg-white/4 py-3.5 pr-4 pl-12 text-[15px] text-slate-100 outline-none ring-[3px] ring-red-500/15 transition-all duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-red-500/15 disabled:opacity-60 short:py-3 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

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
  if (loading.value || !isFormValid.value) return

  errors.code = ''
  pageError.value = ''

  try {
    await verifyMfa(useRecoveryCode.value
      ? { recoveryCode: form.recoveryCode.trim() }
      : { code: form.code })
  } catch (error) {
    const apiError = toApiError(error, 'Two-factor verification failed')

    if (apiError.code === 'MFA_CHALLENGE_EXPIRED') {
      challengeExpired.value = true
      pageError.value = apiError.message
    } else if (apiError.status === 400) {
      errors.code = apiError.fieldErrors.code || apiError.message
      form.code = ''
      codeInput.value?.focus()
    } else if (apiError.status === 429) {
      pageError.value = 'Too many attempts. Please wait a moment and try again.'
    } else {
      // Locked or disabled accounts cannot finish signing in with this challenge.
      pageError.value = apiError.message
      challengeExpired.value = apiError.status === 401 || apiError.status === 403
    }
  }
}

useHead({
  title: 'Two-Factor Sign In',
  meta: [
    { name: 'description', content: 'Confirm your sign-in to CourseAuraHub Academy with your authenticator app' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
