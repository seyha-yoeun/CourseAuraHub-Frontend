<template>
  <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex items-center gap-3 border-b border-white/6 pb-4 light:border-slate-200">
      <ShieldCheck :size="20" class="text-violet-400" />
      <div>
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Your data') }}</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">{{ t('Download a copy or delete your account') }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="max-w-90 text-[13px] text-white/55 light:text-slate-600">
          {{ t('Get everything we store about you — courses, orders, progress, notes and reviews — as a JSON file.') }}
        </p>
        <a
          href="/api/me/data-export"
          download
          class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-slate-100 no-underline hover:bg-white/10 light:border-slate-200 light:bg-slate-50 light:text-slate-800"
        >
          <Download :size="15" /> {{ t('Download my data') }}
        </a>
      </div>

      <div class="rounded-xl border border-rose-500/25 bg-rose-500/6 p-4 light:border-rose-200 light:bg-rose-50">
        <h4 class="text-sm font-bold text-rose-300 light:text-rose-700">{{ t('Delete account') }}</h4>
        <p class="mt-1 text-[13px] text-white/55 light:text-slate-600">
          {{ t('This removes your profile, notes, wishlist and sign-in methods and signs you out everywhere. Receipts and certificates stay, without your name. It can\'t be undone.') }}
        </p>

        <button
          v-if="!open"
          type="button"
          class="mt-3 cursor-pointer rounded-[10px] border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 light:text-rose-700"
          @click="open = true"
        >
          {{ t('Delete my account') }}
        </button>

        <form v-else class="mt-3 flex flex-col gap-3" @submit.prevent="submit">
          <div class="flex flex-col gap-1.5">
            <label for="delete-confirm" :class="labelClass">{{ t('Type your email to confirm') }}</label>
            <input id="delete-confirm" v-model="confirmation" type="email" autocomplete="off" :placeholder="auth.userEmail" :class="inputClass" :disabled="busy">
          </div>
          <div v-if="hasPassword" class="flex flex-col gap-1.5">
            <label for="delete-password" :class="labelClass">{{ t('Password') }}</label>
            <input id="delete-password" v-model="password" type="password" autocomplete="current-password" :class="inputClass" :disabled="busy">
          </div>
          <p v-if="formError" class="text-xs text-rose-400" role="alert">{{ formError }}</p>
          <div class="flex justify-end gap-2">
            <button type="button" class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 light:border-slate-200 light:bg-white light:text-slate-700" :disabled="busy" @click="reset">
              {{ t('Cancel') }}
            </button>
            <button
              type="submit"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-rose-500/50 bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="busy || !canSubmit"
            >
              <Loader2 v-if="busy" :size="14" class="animate-spin" />
              <Trash2 v-else :size="14" />
              {{ t('Permanently delete') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Loader2, ShieldCheck, Trash2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
const auth = useAuth()

const open = ref(false)
const busy = ref(false)
const confirmation = ref('')
const password = ref('')
const formError = ref('')

const hasPassword = computed(() => !auth.user?.provider || auth.user.provider === 'LOCAL')
const canSubmit = computed(() =>
  confirmation.value.trim().toLowerCase() === (auth.userEmail || '').toLowerCase()
  && (!hasPassword.value || password.value.length > 0))

const labelClass = 'text-[11px] font-semibold tracking-wider text-white/50 uppercase light:text-slate-500'
const inputClass = 'w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.25 text-[13px] text-slate-100 outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/15 disabled:opacity-60 light:border-slate-300 light:bg-white light:text-slate-900'

function reset() {
  open.value = false
  confirmation.value = ''
  password.value = ''
  formError.value = ''
}

async function submit() {
  busy.value = true
  formError.value = ''
  try {
    await auth.deleteAccount(confirmation.value.trim(), password.value)
  } catch (error) {
    formError.value = getErrorMessage(error, t('Unable to delete your account'))
  } finally {
    busy.value = false
  }
}
</script>
