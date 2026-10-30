<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Account</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Manage your public profile and sign-in details.</p>
    </div>

    <div v-if="pending" class="grid gap-5 lg:grid-cols-[1fr_380px]">
      <div class="h-110 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
      <div class="h-80 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="!profile" class="rounded-[20px] border border-rose-500/25 bg-rose-500/8 px-6 py-10 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
      Unable to load your profile.
      <button type="button" class="ml-2 cursor-pointer font-semibold underline" @click="refresh()">Try again</button>
    </div>

    <div v-else class="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
      <!-- Profile -->
      <form class="rounded-[18px] border border-white/10 bg-white/5 p-5 sm:p-6 light:border-slate-200 light:bg-white" @submit.prevent="saveProfile">
        <div class="mb-5 flex items-center gap-4">
          <img :src="profileForm.imageUrl || auth.userAvatar" alt="" class="size-16 rounded-full border-2 border-violet-500/40 bg-violet-500/15 object-cover">
          <div class="min-w-0">
            <h2 class="truncate text-base font-bold text-slate-100 light:text-slate-900">{{ displayName }}</h2>
            <p class="truncate text-xs text-white/45 light:text-slate-500">{{ profile.email }}</p>
            <span class="mt-1 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-px text-[10px] font-semibold tracking-wider text-white/55 uppercase light:border-slate-200 light:bg-slate-100 light:text-slate-600">
              {{ profile.provider === 'LOCAL' ? 'Email account' : `${profile.provider.toLowerCase()} sign-in` }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label :class="labelClass" for="first-name">First name</label>
            <input id="first-name" v-model="profileForm.firstName" type="text" required maxlength="100" :class="inputClass">
            <p v-if="fieldErrors.firstName" class="text-[11px] text-rose-400">{{ fieldErrors.firstName }}</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label :class="labelClass" for="last-name">Last name</label>
            <input id="last-name" v-model="profileForm.lastName" type="text" maxlength="100" :class="inputClass">
            <p v-if="fieldErrors.lastName" class="text-[11px] text-rose-400">{{ fieldErrors.lastName }}</p>
          </div>
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label :class="labelClass" for="image-url">Avatar URL</label>
            <input id="image-url" v-model="profileForm.imageUrl" type="url" maxlength="500" placeholder="https://…" :class="inputClass">
            <p v-if="fieldErrors.imageUrl" class="text-[11px] text-rose-400">{{ fieldErrors.imageUrl }}</p>
          </div>
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label :class="labelClass" for="bio">Bio</label>
            <textarea id="bio" v-model="profileForm.bio" rows="3" maxlength="1000" placeholder="A sentence or two about you" :class="inputClass" />
            <p v-if="fieldErrors.bio" class="text-[11px] text-rose-400">{{ fieldErrors.bio }}</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label :class="labelClass" for="website">Website</label>
            <input id="website" v-model="profileForm.website" type="url" maxlength="500" placeholder="https://…" :class="inputClass">
          </div>
          <div class="flex flex-col gap-1.5">
            <label :class="labelClass" for="twitter">Twitter / X</label>
            <input id="twitter" v-model="profileForm.twitter" type="text" maxlength="100" placeholder="@handle" :class="inputClass">
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <button type="submit" :class="primaryButton" :disabled="savingProfile">
            <Loader2 v-if="savingProfile" :size="15" class="animate-spin" />
            Save profile
          </button>
        </div>
      </form>

      <!-- Password -->
      <form
        v-if="profile.hasPassword"
        class="rounded-[18px] border border-white/10 bg-white/5 p-5 sm:p-6 light:border-slate-200 light:bg-white"
        @submit.prevent="savePassword"
      >
        <h2 class="flex items-center gap-2 text-base font-bold text-slate-100 light:text-slate-900">
          <KeyRound :size="17" class="text-violet-400" /> Change password
        </h2>
        <p class="mt-1 text-xs text-white/45 light:text-slate-500">You'll stay signed in here; other devices will be signed out.</p>

        <div class="mt-4 flex flex-col gap-3.5">
          <div class="flex flex-col gap-1.5">
            <label :class="labelClass" for="current-password">Current password</label>
            <input id="current-password" v-model="passwordForm.current" type="password" required autocomplete="current-password" :class="inputClass">
          </div>
          <div class="flex flex-col gap-1.5">
            <label :class="labelClass" for="new-password">New password</label>
            <input id="new-password" v-model="passwordForm.next" type="password" required autocomplete="new-password" :class="inputClass">
            <PasswordStrengthMeter :password="passwordForm.next" :show="!!passwordForm.next" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label :class="labelClass" for="confirm-password">Confirm new password</label>
            <input id="confirm-password" v-model="passwordForm.confirm" type="password" required autocomplete="new-password" :class="inputClass">
            <p v-if="passwordForm.confirm && passwordForm.confirm !== passwordForm.next" class="text-[11px] text-rose-400">Passwords don't match.</p>
          </div>
          <p v-if="passwordError" class="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">{{ passwordError }}</p>
        </div>

        <div class="mt-5 flex justify-end">
          <button type="submit" :class="primaryButton" :disabled="savingPassword || !canSubmitPassword">
            <Loader2 v-if="savingPassword" :size="15" class="animate-spin" />
            Update password
          </button>
        </div>
      </form>

      <div v-else class="rounded-[18px] border border-white/10 bg-white/5 p-5 text-[13px] text-white/55 sm:p-6 light:border-slate-200 light:bg-white light:text-slate-600">
        <h2 class="mb-1 flex items-center gap-2 text-base font-bold text-slate-100 light:text-slate-900">
          <KeyRound :size="17" class="text-violet-400" /> Sign-in
        </h2>
        You sign in with {{ profile.provider.toLowerCase() }}, so there's no password to manage here.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KeyRound, Loader2 } from 'lucide-vue-next'
import type { LearnerProfile } from '~/types'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'
import { useLearning } from '~/composables/useLearning'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage, toApiError } from '~/utils/apiError'

useHead({ title: 'Account' })

const auth = useAuth()
const toast = useAppToast()
const { fetchProfile, updateProfile, changePassword } = useLearning()

const labelClass = 'text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600'
const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600'
const primaryButton = 'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.25 text-[13px] font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'

// Mirrors the backend @PasswordStrength rule
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const { data: profile, pending, refresh } = await useAsyncData<LearnerProfile>('my-profile', fetchProfile, { server: false })

const profileForm = reactive({ firstName: '', lastName: '', imageUrl: '', bio: '', website: '', twitter: '' })
const fieldErrors = ref<Record<string, string>>({})
const savingProfile = ref(false)

const passwordForm = reactive({ current: '', next: '', confirm: '' })
const passwordError = ref('')
const savingPassword = ref(false)

const displayName = computed(() => [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ') || profile.value?.email || '')

const canSubmitPassword = computed(() =>
  Boolean(passwordForm.current && passwordForm.next && passwordForm.next === passwordForm.confirm)
)

watch(profile, (value) => {
  if (!value) return
  profileForm.firstName = value.firstName ?? ''
  profileForm.lastName = value.lastName ?? ''
  profileForm.imageUrl = value.imageUrl ?? ''
  profileForm.bio = value.bio ?? ''
  profileForm.website = value.website ?? ''
  profileForm.twitter = value.twitter ?? ''
}, { immediate: true })

async function saveProfile() {
  savingProfile.value = true
  fieldErrors.value = {}
  try {
    // Blank optional fields are sent as empty strings, which the backend clears
    const updated = await updateProfile({
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      imageUrl: profileForm.imageUrl.trim(),
      bio: profileForm.bio.trim(),
      website: profileForm.website.trim(),
      twitter: profileForm.twitter.trim()
    })
    profile.value = updated
    auth.updateUser({
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatar: updated.imageUrl || undefined
    })
    toast.success('Profile Saved')
  } catch (err) {
    const apiError = toApiError(err, 'Unable to update your profile')
    fieldErrors.value = apiError.fieldErrors
    toast.error('Profile Not Saved', apiError.message)
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  passwordError.value = ''
  if (!PASSWORD_PATTERN.test(passwordForm.next)) {
    passwordError.value = 'Use at least 8 characters with upper and lower case letters, a number, and one of @$!%*?&.'
    return
  }
  savingPassword.value = true
  try {
    await changePassword(passwordForm.current, passwordForm.next)
    passwordForm.current = ''
    passwordForm.next = ''
    passwordForm.confirm = ''
    toast.success('Password Updated', 'Other devices have been signed out.')
  } catch (err) {
    passwordError.value = getErrorMessage(err, 'Unable to change your password')
  } finally {
    savingPassword.value = false
  }
}
</script>
