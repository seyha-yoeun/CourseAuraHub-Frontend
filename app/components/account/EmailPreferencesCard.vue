<template>
  <section class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
    <div class="flex items-start gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/12">
        <Mail :size="20" class="text-violet-300 light:text-violet-700" />
      </div>
      <div>
        <h2 class="text-sm font-bold text-slate-100 light:text-slate-900">{{ t('Email') }}</h2>
        <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ t('Choose which notifications are also emailed: right away, in one daily digest, or not at all.') }}</p>
      </div>
    </div>

    <div v-if="pending" class="mt-4 flex flex-col gap-2">
      <div v-for="i in 4" :key="i" class="h-9 animate-pulse rounded-lg bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" class="mt-3 text-xs text-rose-400">{{ getErrorMessage(error, t('Unable to load email preferences')) }}</p>

    <ul v-else class="m-0 mt-4 flex list-none flex-col divide-y divide-white/6 p-0 light:divide-slate-200">
      <li v-for="preference in preferences" :key="preference.type" class="flex flex-wrap items-center justify-between gap-2 py-2.5">
        <span class="text-[13px] text-slate-100 light:text-slate-900">{{ t(EMAIL_TYPE_LABELS[preference.type] ?? preference.type) }}</span>
        <div class="inline-flex rounded-[10px] border border-white/10 bg-white/4 p-0.5 light:border-slate-200 light:bg-slate-100" role="radiogroup" :aria-label="t(EMAIL_TYPE_LABELS[preference.type] ?? preference.type)">
          <button
            v-for="mode in modes"
            :key="mode.value"
            type="button"
            role="radio"
            :aria-checked="preference.mode === mode.value"
            class="cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-wait"
            :class="preference.mode === mode.value
              ? 'bg-violet-500/25 text-violet-200 light:bg-white light:text-violet-700 light:shadow-sm'
              : 'text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-800'"
            :disabled="saving === preference.type"
            @click="choose(preference, mode.value)"
          >
            {{ t(mode.label) }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
import type { EmailMode, EmailPreference } from '~/types/emailPreference'
import { useAppToast } from '~/composables/useAppToast'
import { EMAIL_TYPE_LABELS, useEmailPreferences } from '~/composables/useEmailPreferences'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
const toast = useAppToast()
const { fetchEmailPreferences, saveEmailPreferences } = useEmailPreferences()

const modes: { value: EmailMode, label: string }[] = [
  { value: 'instant', label: 'Right away' },
  { value: 'digest', label: 'Daily digest' },
  { value: 'off', label: 'Off' },
]

const { data, pending, error } = await useAsyncData('email-preferences', fetchEmailPreferences, { server: false })
const preferences = computed(() => data.value ?? [])
const saving = ref<string | null>(null)

async function choose(preference: EmailPreference, mode: EmailMode) {
  if (preference.mode === mode) return
  saving.value = preference.type
  try {
    data.value = await saveEmailPreferences([{ type: preference.type, mode }])
  } catch (err) {
    toast.error(t('Setting not saved'), getErrorMessage(err, t('Please try again.')))
  } finally {
    saving.value = null
  }
}
</script>
