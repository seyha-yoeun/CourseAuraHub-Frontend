<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Platform Settings</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">
          Manage academy branding, admin profile, and notification preferences.
        </p>
      </div>

      <button
        type="button"
<<<<<<< HEAD
        class="save-btn"
        :disabled="saving || pending || Boolean(loadErrorMessage)"
=======
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5.5 py-2.5 text-[13px] font-semibold text-white transition-all enabled:hover:from-violet-500 enabled:hover:to-indigo-500 enabled:hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        :disabled="saving"
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
        @click="saveSettings"
      >
        <Loader2 v-if="saving" :size="16" class="animate-spin" />
        <Check v-else-if="saveSuccess" :size="16" class="text-emerald-400" />
        <Save v-else :size="16" />
        <span>{{ saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes' }}</span>
      </button>
    </div>

    <!-- Alert banner on success -->
    <Transition v-bind="alertAnim">
      <div v-if="saveSuccess" class="flex items-center gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/12 px-4.5 py-3 text-[13px] font-medium text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700">
        <CheckCircle2 :size="18" class="text-emerald-400" />
        <span>Platform settings and profile have been updated successfully!</span>
      </div>
    </Transition>

<<<<<<< HEAD
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
=======
    <div v-if="pending" class="h-120 w-full animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />

    <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-2">
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
      <!-- Profile Settings -->
      <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
        <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
          <User :size="20" class="text-violet-400" />
          <div>
            <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Admin Profile</h3>
            <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Personal details displayed across the platform</p>
          </div>
        </div>

<<<<<<< HEAD
        <div class="avatar-edit-row">
          <img :src="form.profile.avatar || auth.userAvatar" alt="Avatar" class="avatar-preview" />
          <div class="avatar-meta">
            <span class="avatar-label">Profile Avatar</span>
            <span class="avatar-note">Managed through your account profile</span>
=======
        <div class="mb-5 flex items-center gap-4">
          <img :src="form.profile.avatar" alt="Avatar" class="size-13 rounded-full border-2 border-violet-500/40 bg-violet-500/15" >
          <div class="flex flex-col">
            <span class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Profile Avatar</span>
            <span class="mt-0.5 text-[11px] text-white/40 light:text-slate-500">Using DiceBear animated SVGs for avatars</span>
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
          </div>
        </div>

        <div class="flex flex-col gap-3.5">
          <div class="flex flex-col gap-3 sm:flex-row">
            <div class="flex flex-1 flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Full Name</label>
              <input v-model="form.profile.name" type="text" class="w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" >
            </div>
<<<<<<< HEAD
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input v-model="form.profile.email" type="email" class="form-input" readonly />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Platform Role</label>
            <input v-model="form.profile.role" type="text" class="form-input" readonly />
=======
            <div class="flex flex-1 flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Email Address</label>
              <input v-model="form.profile.email" type="email" class="w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" >
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Platform Role</label>
            <input v-model="form.profile.role" type="text" class="w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" >
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Bio</label>
            <textarea v-model="form.profile.bio" rows="3" class="w-full resize-y rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" />
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <div class="flex flex-1 flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Website</label>
              <input v-model="form.profile.website" type="url" class="w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" >
            </div>
            <div class="flex flex-1 flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Twitter / X Handle</label>
              <input v-model="form.profile.twitter" type="text" class="w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" >
            </div>
          </div>
        </div>
      </div>

      <!-- Platform & Notification Settings -->
      <div class="flex flex-col gap-4">
        <!-- Platform Branding -->
        <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
          <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
            <Building2 :size="20" class="text-blue-400" />
            <div>
              <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Academy Branding</h3>
              <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">General storefront details and configuration</p>
            </div>
          </div>

          <div class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Platform Name</label>
              <input v-model="form.platformName" type="text" class="w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" >
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Platform Tagline</label>
              <input v-model="form.platformTagline" type="text" class="w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600" >
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <div class="flex flex-1 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Default Currency</label>
                <select v-model="form.currency" class="w-full cursor-pointer rounded-[10px] border border-white/9 bg-zinc-950 px-3 py-2.25 text-[13px] text-slate-200 outline-none transition-all duration-200 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div class="flex flex-1 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500">Language</label>
                <select v-model="form.defaultLanguage" class="w-full cursor-pointer rounded-[10px] border border-white/9 bg-zinc-950 px-3 py-2.25 text-[13px] text-slate-200 outline-none transition-all duration-200 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:focus:border-violet-600">
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
        <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
          <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
            <Bell :size="20" class="text-emerald-400" />
            <div>
              <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Notification Alerts</h3>
              <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Customize which events trigger admin alerts</p>
            </div>
          </div>

          <div class="flex flex-col gap-3.5">
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4 light:border-slate-200 light:bg-slate-50 light:hover:bg-slate-100">
              <div>
                <span class="block text-[13px] font-semibold text-slate-200 light:text-slate-800">New Course Enrollment</span>
                <span class="mt-0.5 block text-[11px] text-white/40 light:text-slate-500">Receive instant notice when a student buys a course</span>
              </div>
              <input
                v-model="form.notifications.newEnrollment"
                type="checkbox"
                class="size-4.5 shrink-0 cursor-pointer accent-violet-600"
              >
            </label>

            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4 light:border-slate-200 light:bg-slate-50 light:hover:bg-slate-100">
              <div>
                <span class="block text-[13px] font-semibold text-slate-200 light:text-slate-800">Course Completion Alerts</span>
                <span class="mt-0.5 block text-[11px] text-white/40 light:text-slate-500">Notify when a student finishes all curriculum modules</span>
              </div>
              <input
                v-model="form.notifications.courseCompletion"
                type="checkbox"
                class="size-4.5 shrink-0 cursor-pointer accent-violet-600"
              >
            </label>

            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4 light:border-slate-200 light:bg-slate-50 light:hover:bg-slate-100">
              <div>
                <span class="block text-[13px] font-semibold text-slate-200 light:text-slate-800">Weekly Revenue Summary</span>
                <span class="mt-0.5 block text-[11px] text-white/40 light:text-slate-500">Get an automated weekly analytics report via email</span>
              </div>
              <input
                v-model="form.notifications.weeklyReport"
                type="checkbox"
                class="size-4.5 shrink-0 cursor-pointer accent-violet-600"
              >
            </label>

            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4 light:border-slate-200 light:bg-slate-50 light:hover:bg-slate-100">
              <div>
                <span class="block text-[13px] font-semibold text-slate-200 light:text-slate-800">Product News &amp; Marketing</span>
                <span class="mt-0.5 block text-[11px] text-white/40 light:text-slate-500">Receive updates on new features and course creator tips</span>
              </div>
              <input
                v-model="form.notifications.marketingEmails"
                type="checkbox"
                class="size-4.5 shrink-0 cursor-pointer accent-violet-600"
              >
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

const alertAnim = {
  enterActiveClass: 'transition-opacity duration-300 ease-out',
  leaveActiveClass: 'transition-opacity duration-300 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

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
<<<<<<< HEAD

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
=======
>>>>>>> 076405e19b4b47918fed9943946c790916c61e2b
