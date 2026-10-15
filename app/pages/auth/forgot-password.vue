<template>
  <div class="auth-card" v-motion="cardMotion">
    <!-- Header -->
    <div class="auth-header">
      <h1 class="auth-title">Forgot Password</h1>
      <p class="auth-subtitle">Enter your email and we'll send you a reset link</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleForgotPassword" class="auth-form">
      <div class="form-field" v-motion="fieldMotion">
        <label for="email" class="form-label">Email</label>
        <div class="auth-input-wrapper">
          <Mail class="auth-input-icon" :size="18" />
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="auth-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
            :disabled="loading || submitted"
            :class="{ 'auth-input-error': errors.email }"
          />
        </div>
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
      </div>

      <button
        type="submit"
        class="btn btn-emerald btn-submit"
        :disabled="loading || submitted"
      >
        <Loader2 :size="20" class="animate-spin" v-if="loading" />
        <span v-else-if="submitted">Email Sent</span>
        <span v-else>Send Reset Link</span>
      </button>
    </form>

    <!-- Success State -->
    <div v-if="submitted" class="success-state" v-motion="successMotion">
      <div class="success-icon">
        <MailCheck :size="48" />
      </div>
      <h2 class="success-title">Check Your Inbox</h2>
      <p class="success-description">
        We've sent a password reset link to <strong>{{ form.email }}</strong>.
        The link will expire in 1 hour.
      </p>
      <p class="success-hint">
        Didn't receive it? 
        <button type="button" class="link-btn" @click="resendEmail">Resend email</button>
        or check your spam folder.
      </p>
    </div>

    <!-- Footer -->
    <p class="auth-footer">
      Remember your password? 
      <NuxtLink to="/auth/login" class="auth-link">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  Mail, 
  Loader2, 
  MailCheck 
} from 'lucide-vue-next'

const loading = ref(false)
const submitted = ref(false)

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

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
      body: { email: form.email }
    })
    submitted.value = true
  } catch (e: unknown) {
    const message = (e as { response?: { _data?: { message: string } } }).response?._data?.message 
      || (e as Error)?.message 
      || 'Failed to send reset email'
    errors.email = message
  } finally {
    loading.value = false
  }
}

function resendEmail() {
  submitted.value = false
  handleForgotPassword()
}

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

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
}

html.light .form-label {
  color: #334155;
}

.form-error {
  font-size: 12px;
  color: #ef4444;
  margin: 0;
  min-height: 16px;
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
  opacity: 0.6;
  cursor: not-allowed;
}

.success-state {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--emerald-400);
}

html.light .success-icon {
  background: var(--emerald-50);
  border-color: var(--emerald-200);
  color: var(--emerald-600);
}

.success-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}

html.light .success-title {
  color: #0f172a;
}

.success-description {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  line-height: 1.6;
  margin: 0;
}

html.light .success-description {
  color: #475569;
}

.success-hint {
  font-size: 13px;
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
  margin: 0;
}

html.light .success-hint {
  color: #94a3b8;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--emerald-500);
  cursor: pointer;
  transition: color 0.2s ease;
}

.link-btn:hover {
  color: var(--emerald-400);
  text-decoration: underline;
}

html.light .link-btn {
  color: var(--emerald-600);
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
</style>
