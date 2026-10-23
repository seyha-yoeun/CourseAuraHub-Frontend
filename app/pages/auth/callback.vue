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
