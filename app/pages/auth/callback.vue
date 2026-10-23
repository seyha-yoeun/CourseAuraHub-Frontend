<template>
  <div
    v-motion="cardMotion"
    class="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-xl short:p-6 light:border-black/10 light:bg-white/90 light:shadow-[0_25px_50px_rgba(0,0,0,0.1),0_0_60px_rgba(16,185,129,0.08)]"
  >
    <div class="flex flex-col items-center px-4 py-8 text-center">
      <!-- Loading State -->
      <div v-if="status === 'loading'" class="flex w-full flex-col items-center gap-4">
        <div class="relative size-16">
          <div class="absolute inset-0 animate-spin rounded-full border-[3px] border-emerald-500/15 border-t-emerald-500" />
          <div class="absolute -inset-2.5 animate-pulse-ring rounded-full border border-emerald-500/15" />
        </div>
        <h2 class="text-[22px] font-bold tracking-[-0.3px] text-slate-100 light:text-slate-900">Completing Sign In</h2>
        <p class="text-sm leading-relaxed text-white/60 light:text-slate-600">Please wait while we verify your account...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="status === 'success'" class="flex w-full flex-col items-center gap-4">
        <div class="flex size-18 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/12 text-emerald-400 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-600">
          <CheckCircle :size="48" />
        </div>
        <h2 class="text-[22px] font-bold tracking-[-0.3px] text-slate-100 light:text-slate-900">Welcome Back!</h2>
        <p class="text-sm leading-relaxed text-white/60 light:text-slate-600">You have been successfully signed in.</p>
        <div class="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-medium text-emerald-400 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700">
          <Loader2 :size="18" class="animate-spin" />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="status === 'error'" class="flex w-full flex-col items-center gap-4">
        <div class="flex size-18 items-center justify-center rounded-full border border-red-500/30 bg-red-500/12 text-red-400 light:border-red-200 light:bg-red-50 light:text-red-600">
          <AlertCircle :size="48" />
        </div>
        <h2 class="text-[22px] font-bold tracking-[-0.3px] text-slate-100 light:text-slate-900">Authentication Failed</h2>
        <p class="text-sm leading-relaxed text-white/60 light:text-slate-600">{{ errorMessage }}</p>
        <div class="mt-2 flex w-full items-center gap-3">
          <button
            type="button"
            class="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 px-5 py-3 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)]"
            @click="retryLogin"
          >
            Try Again
          </button>
          <NuxtLink
            to="/auth/login"
            class="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-5 py-3 text-[15px] font-semibold text-white/80 no-underline transition-all duration-200 hover:border-emerald-500/30 hover:bg-white/12 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200"
          >
            Back to Sign In
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import {
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { fetchUser } = useAuth()

type Status = 'loading' | 'success' | 'error'
const status = ref<Status>('loading')
const errorMessage = ref('')

const cardMotion = {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

async function handleCallback() {
  try {
    // The backend callback endpoint sets cookies, then we fetch user to verify
    const success = await fetchUser()

    if (success) {
      status.value = 'success'

      // Redirect after brief delay
      setTimeout(() => {
        const redirect = route.query.redirect as string || '/'
        router.push(redirect)
      }, 1500)
    } else {
      throw new Error('Failed to authenticate')
    }
  } catch (e) {
    status.value = 'error'
    errorMessage.value = (e as Error)?.message || 'Unable to complete authentication. Please try again.'
  }
}

function retryLogin() {
  status.value = 'loading'
  errorMessage.value = ''
  handleCallback()
}

onMounted(() => {
  handleCallback()
})

useHead({
  title: 'Signing In...',
  meta: [
    { name: 'description', content: 'Completing authentication...' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
