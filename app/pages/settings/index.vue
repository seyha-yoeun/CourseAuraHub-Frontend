<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Platform Settings</h1>
        <p class="page-sub">
          Manage academy branding, admin profile, and notification preferences.
        </p>
      </div>

      <button
        type="button"
        class="save-btn"
        :disabled="saving || pending || Boolean(loadErrorMessage)"
        @click="saveSettings"
      >
        <Loader2 v-if="saving" :size="16" class="animate-spin" />
        <Check v-else-if="saveSuccess" :size="16" class="text-emerald-400" />
        <Save v-else :size="16" />
        <span>{{ saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes' }}</span>
      </button>
    </div>

    <!-- Alert banner on success -->
    <Transition name="fade-alert">
      <div v-if="saveSuccess" class="success-banner">
        <CheckCircle2 :size="18" class="text-emerald-400" />
        <span>Platform settings and profile have been updated successfully!</span>
      </div>
    </Transition>

    <div v-if="saveError" class="error-banner" role="alert">
      <span>{{ saveError }}</span>
    </div>

    <div v-if="pending" class="shimmer skeleton-settings"></div>

    <div v-else-if="loadErrorMessage" class="settings-error glass">
      <h3 class="card-title">Unable to load settings</h3>
      <p class="card-desc">{{ loadErrorMessage }}</p>
      <button type="button" class="save-btn" @click="refresh()">
        <RefreshCw :size="16" />
        <span>Try Again</span>
      </button>
    </div>

    <div v-else class="settings-grid">
      <!-- Profile Settings -->
      <div class="settings-card glass">
        <div class="card-head">
          <User :size="20" class="text-violet-400" />
          <div>
            <h3 class="card-title">Admin Profile</h3>
            <p class="card-desc">Personal details displayed across the platform</p>
          </div>
        </div>

        <div class="avatar-edit-row">
          <img :src="form.profile.avatar || auth.userAvatar" alt="Avatar" class="avatar-preview" />
          <div class="avatar-meta">
            <span class="avatar-label">Profile Avatar</span>
            <span class="avatar-note">Managed through your account profile</span>
          </div>
        </div>

        <div class="form-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input v-model="form.profile.name" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input v-model="form.profile.email" type="email" class="form-input" readonly />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Platform Role</label>
            <input v-model="form.profile.role" type="text" class="form-input" readonly />
          </div>

          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea v-model="form.profile.bio" rows="3" class="form-textarea"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Website</label>
              <input v-model="form.profile.website" type="url" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Twitter / X Handle</label>
              <input v-model="form.profile.twitter" type="text" class="form-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- Platform & Notification Settings -->
      <div class="right-col">
        <!-- Platform Branding -->
        <div class="settings-card glass">
          <div class="card-head">
            <Building2 :size="20" class="text-blue-400" />
            <div>
              <h3 class="card-title">Academy Branding</h3>
              <p class="card-desc">General storefront details and configuration</p>
            </div>
          </div>

          <div class="form-body">
            <div class="form-group">
              <label class="form-label">Platform Name</label>
              <input v-model="form.platformName" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Platform Tagline</label>
              <input v-model="form.platformTagline" type="text" class="form-input" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Default Currency</label>
                <select v-model="form.currency" class="form-select">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Language</label>
                <select v-model="form.defaultLanguage" class="form-select">
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Preferences -->
        <div class="settings-card glass mt-4">
          <div class="card-head">
            <Bell :size="20" class="text-emerald-400" />
            <div>
              <h3 class="card-title">Notification Alerts</h3>
              <p class="card-desc">Customize which events trigger admin alerts</p>
            </div>
          </div>

          <div class="toggles-list">
            <label class="toggle-item">
              <div>
                <span class="toggle-title">New Course Enrollment</span>
                <span class="toggle-sub">Receive instant notice when a student buys a course</span>
              </div>
              <input
                v-model="form.notifications.newEnrollment"
                type="checkbox"
                class="toggle-checkbox"
              />
            </label>

            <label class="toggle-item">
              <div>
                <span class="toggle-title">Course Completion Alerts</span>
                <span class="toggle-sub">Notify when a student finishes all curriculum modules</span>
              </div>
              <input
                v-model="form.notifications.courseCompletion"
                type="checkbox"
                class="toggle-checkbox"
              />
            </label>

            <label class="toggle-item">
              <div>
                <span class="toggle-title">Weekly Revenue Summary</span>
                <span class="toggle-sub">Get an automated weekly analytics report via email</span>
              </div>
              <input
                v-model="form.notifications.weeklyReport"
                type="checkbox"
                class="toggle-checkbox"
              />
            </label>

            <label class="toggle-item">
              <div>
                <span class="toggle-title">Product News & Marketing</span>
                <span class="toggle-sub">Receive updates on new features and course creator tips</span>
              </div>
              <input
                v-model="form.notifications.marketingEmails"
                type="checkbox"
                class="toggle-checkbox"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  User,
  Building2,
  Bell,
  Save,
  Check,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-vue-next'
import type { PlatformSettings } from '~/types'
import { useAppToast } from '~/composables/useAppToast'
import { useAuth } from '~/composables/useAuth'
import { toApiError } from '~/utils/apiError'

definePageMeta({ requiresAdmin: true })

useHead({
  title: 'Platform Settings',
})

const auth = useAuth()
const { success } = useAppToast()

const {
  data: initialSettings,
  pending,
  error: settingsError,
  refresh,
} = await useAsyncData<PlatformSettings>(
  'platform-settings',
  () => $fetch<PlatformSettings>('/api/settings', { credentials: 'include' }),
  { server: false },
)

const form = reactive<PlatformSettings>({
  platformName: '',
  platformTagline: '',
  currency: 'USD',
  defaultLanguage: 'en',
  notifications: {
    newEnrollment: true,
    courseCompletion: true,
    weeklyReport: true,
    marketingEmails: false,
  },
  profile: {
    name: '',
    email: '',
    role: '',
    avatar: '',
    bio: '',
    website: '',
    twitter: '',
  },
})

const loadErrorMessage = computed(() => {
  if (!settingsError.value) return ''
  return toApiError(settingsError.value, 'Unable to load platform settings').message
})

watch(
  initialSettings,
  (value) => {
    if (value) {
      Object.assign(form, value)
    }
  },
  { immediate: true },
)

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')
let successTimer: ReturnType<typeof setTimeout> | undefined

async function saveSettings() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    const saved = await $fetch<PlatformSettings>('/api/settings', {
      method: 'PUT',
      credentials: 'include',
      body: {
        platformName: form.platformName,
        platformTagline: form.platformTagline,
        currency: form.currency,
        defaultLanguage: form.defaultLanguage,
        notifications: form.notifications,
        profile: {
          name: form.profile.name,
          avatar: form.profile.avatar,
          bio: form.profile.bio,
          website: form.profile.website,
          twitter: form.profile.twitter,
        },
      },
    })

    Object.assign(form, saved)
    auth.setProfile(saved.profile)
    saveSuccess.value = true
    success('Settings Saved', 'Platform branding and profile details updated successfully.')

    if (successTimer) clearTimeout(successTimer)
    successTimer = setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to save settings')
    saveError.value = apiError.status === 403
      ? 'You do not have permission to update platform settings.'
      : apiError.message
  } finally {
    saving.value = false
  }
}

onUnmounted(() => {
  if (successTimer) clearTimeout(successTimer)
})
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.5px;
}

.page-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 4px;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #34d399;
  font-size: 13px;
  font-weight: 500;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 13px;
  font-weight: 500;
}

.settings-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 24px;
  border-radius: 18px;
}

.settings-error .save-btn {
  margin-top: 4px;
}

.form-input[readonly] {
  opacity: 0.65;
  cursor: not-allowed;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.settings-card {
  border-radius: 18px;
  padding: 24px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

.card-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.avatar-edit-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.4);
  background: rgba(124, 58, 237, 0.15);
}

.avatar-meta {
  display: flex;
  flex-direction: column;
}

.avatar-label {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.avatar-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

.form-select {
  background: #11121d;
  color: #e2e8f0;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.06);
}

.toggles-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.toggle-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.toggle-sub {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #7c3aed;
  cursor: pointer;
}

.skeleton-settings {
  width: 100%;
  height: 480px;
  border-radius: 18px;
}

.fade-alert-enter-active,
.fade-alert-leave-active {
  transition: opacity 0.3s;
}
.fade-alert-enter-from,
.fade-alert-leave-to {
  opacity: 0;
}
</style>
