<template>
  <div aria-live="polite">
    <!-- Loading -->
    <div v-if="status === 'loading'" role="status">
      <div :class="authIconBadge">
        <Loader2 :size="22" class="animate-spin" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">{{ t('Completing sign in…') }}</h1>
      <p :class="authSubtitle">{{ t('Hang tight while we confirm your account with the provider.') }}</p>
      <div class="mt-7 h-1 overflow-hidden rounded-full bg-white/8 light:bg-slate-200" aria-hidden="true">
        <div class="h-full w-1/3 animate-[auth-progress_1.2s_ease-in-out_infinite] rounded-full bg-brand-400 motion-reduce:animate-none light:bg-brand-600" />
      </div>
    </div>

    <!-- Success -->
    <div v-else-if="status === 'success'" role="status">
      <div :class="authIconBadge">
        <CircleCheck :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">{{ t('You\'re signed in') }}</h1>
      <p :class="authSubtitle">{{ t('Taking you to where you left off…') }}</p>
      <div class="mt-7 inline-flex items-center gap-2 text-[13px] text-white/55 light:text-slate-500">
        <Loader2 :size="15" class="animate-spin" aria-hidden="true" />
        {{ t('Redirecting') }}
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="status === 'error'" role="alert">
      <div :class="authIconBadgeDanger">
        <AlertCircle :size="22" aria-hidden="true" />
      </div>
      <h1 :class="authTitle">{{ t('We couldn\'t sign you in') }}</h1>
      <p :class="authSubtitle">{{ errorMessage }}</p>
      <div class="mt-7 flex flex-col gap-2.5 short:mt-5">
        <button type="button" :class="authPrimaryButton" @click="retryLogin">
          <RotateCw :size="16" aria-hidden="true" />
          <span>{{ t('Try again') }}</span>
        </button>
        <NuxtLink :to="loginLink" :class="authSecondaryButton">{{ t('Back to log in') }}</NuxtLink>
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
  AlertCircle,
  CircleCheck,
  Loader2,
  RotateCw,
} from 'lucide-vue-next'
import {
  authIconBadge,
  authIconBadgeDanger,
  authPrimaryButton,
  authSecondaryButton,
  authSubtitle,
  authTitle,
} from '~/utils/authUi'

const { t } = useT()

const router = useRouter()
const route = useRoute()
const auth = useAuth()

type Status = 'loading' | 'success' | 'error'
const status = ref<Status>('loading')
const errorMessage = ref('')
let redirectTimer: ReturnType<typeof setTimeout> | undefined

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

  // Two-factor accounts: the backend left a challenge cookie instead of a session.
  if (route.query.mfa === 'required') {
    const redirect = getSafeRedirect(route.query.redirect)
    await router.replace({ path: '/auth/two-factor', query: redirect ? { redirect } : undefined })
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
      t('Unable to complete authentication. Please try again.'),
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
  title: t('Signing In...'),
  meta: [
    { name: 'description', content: t('Completing authentication...') }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>
