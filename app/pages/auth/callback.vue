<<<<<<< HEAD
<template>
  <div class="auth-card" v-motion="cardMotion">
    <div class="callback-content">
      <!-- Loading State -->
      <div v-if="status === 'loading'" class="callback-loading">
        <div class="spinner-wrapper">
          <div class="spinner" />
          <div class="spinner-ring" />
        </div>
        <h2 class="callback-title">Completing Sign In</h2>
        <p class="callback-description">Please wait while we verify your account...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="status === 'success'" class="callback-success">
        <div class="success-icon">
          <CheckCircle :size="48" />
        </div>
        <h2 class="callback-title">Welcome Back!</h2>
        <p class="callback-description">You have been successfully signed in.</p>
        <div class="success-redirect">
          <Loader2 :size="18" class="animate-spin" />
          <span>Redirecting...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="status === 'error'" class="callback-error">
        <div class="error-icon">
          <AlertCircle :size="48" />
        </div>
        <h2 class="callback-title">Authentication Failed</h2>
        <p class="callback-description">{{ errorMessage }}</p>
        <div class="error-actions">
          <button 
            type="button"
            class="btn btn-emerald"
            @click="retryLogin"
          >
            Try Again
          </button>
          <NuxtLink :to="loginLink" class="btn btn-secondary">
            Back to Sign In
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import {
  clearPendingOAuth,
  consumePendingRedirect,
  getOAuthErrorMessage,
  getPendingRedirect,
  getRememberedOAuthProvider,
  getSafeRedirect,
} from '~/utils/authRedirect'
import {
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

type Status = 'loading' | 'success' | 'error'
const status = ref<Status>('loading')
const errorMessage = ref('')
let redirectTimer: ReturnType<typeof setTimeout> | undefined

const cardMotion = {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

const loginLink = computed(() => {
  const redirect = getSafeRedirect(route.query.redirect) || getPendingRedirect()
  return redirect
    ? { path: '/auth/login', query: { redirect } }
    : '/auth/login'
})

async function handleCallback() {
  const oauthError = getOAuthErrorMessage(route.query.error)
  if (oauthError) {
    status.value = 'error'
    errorMessage.value = oauthError
    return
  }

  try {
    // Always re-read the session here: the cookies may have just been replaced
    // by the OAuth provider and the store could still hold a previous user.
    await auth.fetchUser()

    status.value = 'success'

    const redirect = getSafeRedirect(route.query.redirect)
      || consumePendingRedirect()
      || auth.homeRoute

    clearPendingOAuth()

    redirectTimer = setTimeout(() => {
      router.push(redirect)
    }, 1200)
  } catch (error) {
    status.value = 'error'
    errorMessage.value = toApiError(
      error,
      'Unable to complete authentication. Please try again.',
    ).message
  }
}

function retryLogin() {
  const provider = getRememberedOAuthProvider()

  // Restart the provider flow when we know which one was used.
  if (provider) {
    auth.initiateOAuth2(provider)
    return
  }

  status.value = 'loading'
  errorMessage.value = ''
  handleCallback()
}

onMounted(() => {
  handleCallback()
})

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
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

<style scoped>
.callback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
}

.callback-loading,
.callback-success,
.callback-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.spinner-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
}

.spinner {
  position: absolute;
  inset: 0;
  border: 3px solid rgba(16, 185, 129, 0.15);
  border-top-color: var(--emerald-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring {
  position: absolute;
  inset: -10px;
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.callback-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
  letter-spacing: -0.3px;
}

html.light .callback-title {
  color: #0f172a;
}

.callback-description {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  margin: 0;
  line-height: 1.6;
}

html.light .callback-description {
  color: #475569;
}

.success-icon,
.error-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--emerald-400);
}

.error-icon {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

html.light .success-icon {
  background: var(--emerald-50);
  border-color: var(--emerald-200);
  color: var(--emerald-600);
}

html.light .error-icon {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.success-redirect {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 99px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: var(--emerald-400);
  font-size: 13px;
  font-weight: 500;
}

html.light .success-redirect {
  background: var(--emerald-50);
  border-color: var(--emerald-200);
  color: var(--emerald-700);
}

.error-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.error-actions .btn {
  flex: 1;
}
</style>
=======
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
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
