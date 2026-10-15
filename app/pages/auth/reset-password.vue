<template>
  <div class="auth-card" v-motion="cardMotion">
    <!-- Header -->
    <div class="auth-header">
      <h1 class="auth-title">Reset Password</h1>
      <p class="auth-subtitle">Enter your new password below</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleResetPassword" class="auth-form">
      <div class="form-field" v-motion="fieldMotion(0)">
        <label for="password" class="form-label">New Password</label>
        <div class="auth-input-wrapper">
          <Lock class="auth-input-icon" :size="18" />
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="auth-input"
            placeholder="Create a strong password"
            autocomplete="new-password"
            required
            :disabled="loading"
            :class="{ 'auth-input-error': errors.password }"
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

        <PasswordStrengthMeter :password="form.password" :show="!!form.password" />
      </div>

      <div class="form-field" v-motion="fieldMotion(0.08)">
        <label for="confirmPassword" class="form-label">Confirm New Password</label>
        <div class="auth-input-wrapper">
          <Lock class="auth-input-icon" :size="18" />
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="auth-input"
            placeholder="Confirm your new password"
            autocomplete="new-password"
            required
            :disabled="loading"
            :class="{ 'auth-input-error': errors.confirmPassword }"
          />
          <button
            type="button"
            class="auth-toggle-password"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          >
            <Eye :size="18" v-if="!showConfirmPassword" />
            <EyeOff :size="18" v-else />
          </button>
        </div>
        <p v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</p>
      </div>

      <button
        type="submit"
        class="btn btn-emerald btn-submit"
        :disabled="loading || !isFormValid"
        :class="{ 'loading': loading }"
      >
        <Loader2 :size="20" class="animate-spin" v-if="loading" />
        <span v-else>Reset Password</span>
      </button>
    </form>

    <!-- Success State -->
    <div v-if="success" class="success-state" v-motion="successMotion">
      <div class="success-icon">
        <CheckCircle :size="48" />
      </div>
      <h2 class="success-title">Password Reset Complete</h2>
      <p class="success-description">
        Your password has been successfully updated. You can now sign in with your new password.
      </p>
      <NuxtLink to="/auth/login" class="btn btn-emerald" style="margin-top: 16px; width: 100%;">
        Sign In
      </NuxtLink>
    </div>

    <!-- Footer -->
    <p class="auth-footer" v-if="!success">
      Remember your password? 
      <NuxtLink to="/auth/login" class="auth-link">Sign in</NuxtLink>
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

.btn-submit.loading {
  pointer-events: none;
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
