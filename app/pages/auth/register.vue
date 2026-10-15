<template>
  <div class="auth-card" v-motion="cardMotion">
    <!-- Header -->
    <div class="auth-header">
      <h1 class="auth-title">Create your account</h1>
      <p class="auth-subtitle">Join CourseAuraHub Academy and start learning today</p>
    </div>

    <!-- Social Login -->
    <SocialLoginButtons 
      :loading="loading"
      @click="handleSocialLogin"
    />

    <!-- Registration Form -->
    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-row" v-motion="fieldMotion(0)">
        <div class="form-field">
          <label for="firstName" class="form-label">First Name</label>
          <div class="auth-input-wrapper">
            <User class="auth-input-icon" :size="18" />
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="auth-input"
              placeholder="John"
              autocomplete="given-name"
              required
              :disabled="loading"
              :class="{ 'auth-input-error': errors.firstName }"
            />
          </div>
          <p v-if="errors.firstName" class="form-error">{{ errors.firstName }}</p>
        </div>

        <div class="form-field">
          <label for="lastName" class="form-label">Last Name</label>
          <div class="auth-input-wrapper">
            <User class="auth-input-icon" :size="18" />
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="auth-input"
              placeholder="Doe"
              autocomplete="family-name"
              required
              :disabled="loading"
              :class="{ 'auth-input-error': errors.lastName }"
            />
          </div>
          <p v-if="errors.lastName" class="form-error">{{ errors.lastName }}</p>
        </div>
      </div>

      <div class="form-field" v-motion="fieldMotion(0.06)">
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
            :disabled="loading"
            :class="{ 'auth-input-error': errors.email }"
          />
        </div>
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
      </div>

      <div class="form-field" v-motion="fieldMotion(0.12)">
        <label for="password" class="form-label">Password</label>
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

        <!-- Password Strength Meter -->
        <PasswordStrengthMeter :password="form.password" :show="!!form.password" />
      </div>

      <div class="form-field" v-motion="fieldMotion(0.18)">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <div class="auth-input-wrapper">
          <Lock class="auth-input-icon" :size="18" />
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="auth-input"
            placeholder="Confirm your password"
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

      <div class="form-field" v-motion="fieldMotion(0.24)">
        <label class="checkbox-wrapper">
          <input
            v-model="form.terms"
            type="checkbox"
            class="auth-checkbox"
            required
            :disabled="loading"
          />
          <span class="checkbox-custom" />
          <span class="checkbox-label">
            I agree to the 
            <NuxtLink to="/terms" class="auth-link">Terms of Service</NuxtLink>
            and 
            <NuxtLink to="/privacy" class="auth-link">Privacy Policy</NuxtLink>
          </span>
        </label>
        <p v-if="errors.terms" class="form-error">{{ errors.terms }}</p>
      </div>

      <button
        type="submit"
        class="btn btn-emerald btn-submit"
        :disabled="loading || !isFormValid"
        :class="{ 'loading': loading }"
      >
        <Loader2 :size="20" class="animate-spin" v-if="loading" />
        <span v-else>Create Account</span>
      </button>
    </form>

    <!-- Footer -->
    <p class="auth-footer">
      Already have an account? 
      <NuxtLink to="/auth/login" class="auth-link">Sign in</NuxtLink>
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
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
  margin-top: 2px;
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
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.checkbox-label {
  font-size: 13px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  line-height: 1.5;
}

html.light .checkbox-label {
  color: #64748b;
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

  .form-row {
    grid-template-columns: 1fr;
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
