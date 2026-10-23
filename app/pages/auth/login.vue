<template>
  <div class="auth-card" v-motion="cardMotion">
    <!-- Header -->
    <div class="auth-header">
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-subtitle">Sign in to your CourseAuraHub Academy account</p>
    </div>

    <!-- Social Login -->
    <SocialLoginButtons 
      :loading="loading"
      @click="handleSocialLogin"
    />

    <!-- Email/Password Form -->
    <form @submit.prevent="handleLogin" class="auth-form">
      <div v-if="pageError" class="auth-alert" role="alert">
        {{ pageError }}
      </div>

      <div class="form-field" v-motion="fieldMotion(0)">
        <label for="email" class="form-label">Email</label>
        <div class="auth-input-wrapper">
          <Mail class="auth-input-icon" :size="18" />
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="auth-input"
            :class="{ 'auth-input-error': errors.email }"
            placeholder="you@example.com"
            autocomplete="email"
            required
            :disabled="loading"
          />
        </div>
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
      </div>

      <div class="form-field" v-motion="fieldMotion(0.08)">
        <label for="password" class="form-label">Password</label>
        <div class="auth-input-wrapper">
          <Lock class="auth-input-icon" :size="18" />
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="auth-input"
            :class="{ 'auth-input-error': errors.password }"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
            :disabled="loading"
          />
          <button
            type="button"
            class="auth-toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <Eye :size="18" v-if="!showPassword" />
            <EyeOff :size="18" v-else />
          </button>
        </div>
        <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
      </div>

      <div class="form-field" v-motion="fieldMotion(0.16)">
        <label class="checkbox-wrapper">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="auth-checkbox"
            :disabled="loading"
          />
          <span class="checkbox-custom" />
          <span class="checkbox-label">Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        class="btn btn-emerald btn-submit"
        :disabled="loading"
        :class="{ 'loading': loading }"
      >
        <Loader2 :size="20" class="animate-spin" v-if="loading" />
        <span v-else>Sign In</span>
      </button>
    </form>

    <!-- Footer -->
    <p class="auth-footer">
      Don't have an account? 
      <NuxtLink to="/auth/register" class="auth-link">Create one</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-vue-next'
import SocialLoginButtons from '~/components/auth/SocialLoginButtons.vue'

const route = useRoute()
const auth = useAuth()
const { login, initiateOAuth2, loading } = auth

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  email: '',
  password: '',
})

const pageError = ref('')
const showPassword = ref(false)

if (route.query.session === 'expired') {
  pageError.value = 'Your session has expired. Please sign in again.'
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

    if (apiError.status === 401) {
      pageError.value = 'Invalid email or password. Please try again.'
    } else if (apiError.status === 429) {
      pageError.value = 'Too many sign-in attempts. Please wait a moment and try again.'
    } else if (!Object.keys(apiError.fieldErrors).length) {
      pageError.value = apiError.message
    }
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

<style scoped>
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary, #f1f5f9);
  letter-spacing: -0.5px;
  margin: 0 0 8px;
}

html.light .auth-title {
  color: #0f172a;
}

.auth-subtitle {
  font-size: 15px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  margin: 0;
  line-height: 1.5;
}

html.light .auth-subtitle {
  color: #64748b;
}

.auth-form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
}

html.light .form-label {
  color: #334155;
}

.forgot-link {
  font-size: 13px;
  color: var(--emerald-500);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--emerald-400);
  text-decoration: underline;
}

html.light .forgot-link {
  color: var(--emerald-600);
}

.auth-alert {
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  font-size: 13px;
  line-height: 1.45;
}

.form-error {
  font-size: 12px;
  color: #ef4444;
  margin: 0;
  min-height: 16px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.auth-checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

html.light .checkbox-custom {
  border-color: #e2e8f0;
  background: #fff;
}

.auth-checkbox:checked + .checkbox-custom {
  background: linear-gradient(135deg, var(--emerald-500), var(--emerald-600));
  border-color: var(--emerald-500);
}

.auth-checkbox:checked + .checkbox-custom::after {
  content: '';
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translateY(-1px);
}

.auth-checkbox:focus-visible + .checkbox-custom {
  outline: none;
  ring: 2px;
  ring-offset: 2px;
  ring-color: var(--emerald-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

html.light .checkbox-label {
  color: #475569;
}

.btn-submit {
  width: 100%;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-submit.loading {
  pointer-events: none;
}

.auth-footer {
  margin-top: 28px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
}

html.light .auth-footer {
  color: #64748b;
}

.auth-link {
  color: var(--emerald-500);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: var(--emerald-400);
  text-decoration: underline;
}

html.light .auth-link {
  color: var(--emerald-600);
}

@media (max-width: 480px) {
  .auth-title {
    font-size: 24px;
  }
}

/* Compact spacing on short viewports — keeps the auth page scroll-free */
@media (max-height: 900px) {
  .auth-header {
    margin-bottom: 22px;
  }

  .auth-form {
    margin-top: 18px;
    gap: 15px;
  }

  .auth-footer {
    margin-top: 20px;
  }
}

@media (max-height: 800px) {
  .auth-header {
    margin-bottom: 14px;
  }

  .auth-title {
    font-size: 24px;
  }

  .auth-subtitle {
    font-size: 14px;
  }

  .auth-form {
    margin-top: 14px;
    gap: 12px;
  }

  .form-field {
    gap: 6px;
  }

  .btn-submit {
    padding: 13px 24px;
  }

  .auth-footer {
    margin-top: 16px;
  }
}
</style>