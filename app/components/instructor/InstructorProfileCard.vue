<template>
  <section class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-slate-100 light:text-slate-900">Public profile</h2>
        <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">
          Learners see this page from your courses. Your name, photo, bio, website and Twitter come from
          <NuxtLink to="/account" class="font-semibold text-violet-300 light:text-violet-700">your account</NuxtLink>.
        </p>
      </div>
      <NuxtLink
        v-if="profile"
        :to="profile.publicPath"
        class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 no-underline hover:bg-white/10 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
      >
        <ExternalLink :size="13" /> View public page
      </NuxtLink>
    </div>

    <div v-if="pending" class="mt-4 h-32 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />
    <p v-else-if="loadError" class="mt-3 text-xs text-rose-300 light:text-rose-700">{{ loadError }}</p>

    <form v-else class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="save">
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">Handle</span>
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-white/40 light:text-slate-500">/instructors/</span>
          <input v-model="form.handle" type="text" required minlength="3" maxlength="40" pattern="[a-z0-9][a-z0-9\-]{1,38}[a-z0-9]" :class="inputClass">
        </div>
      </label>
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">Headline</span>
        <input v-model="form.headline" type="text" maxlength="160" placeholder="e.g. Backend engineer and Spring trainer" :class="inputClass">
      </label>
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">LinkedIn</span>
        <input v-model="form.linkedinUrl" type="url" maxlength="300" placeholder="https://www.linkedin.com/in/…" :class="inputClass">
      </label>
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">GitHub</span>
        <input v-model="form.githubUrl" type="url" maxlength="300" placeholder="https://github.com/…" :class="inputClass">
      </label>
      <label class="flex flex-col gap-1.5">
        <span :class="labelClass">YouTube</span>
        <input v-model="form.youtubeUrl" type="url" maxlength="300" placeholder="https://www.youtube.com/@…" :class="inputClass">
      </label>
      <div class="flex items-end justify-end">
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="saving"
        >
          <Loader2 v-if="saving" :size="14" class="animate-spin" />
          Save profile
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ExternalLink, Loader2 } from 'lucide-vue-next'
import type { InstructorProfile } from '~/types/instructorProfile'
import { useAppToast } from '~/composables/useAppToast'
import { useInstructorProfile } from '~/composables/useInstructorProfile'
import { getErrorMessage } from '~/utils/apiError'

/** Edits the signed-in instructor's handle, headline and social links. Created on first visit. */
const toast = useAppToast()
const { fetchMine, updateMine } = useInstructorProfile()

const labelClass = 'text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600'
const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600'

const profile = ref<InstructorProfile | null>(null)
const pending = ref(true)
const loadError = ref('')
const saving = ref(false)
const form = reactive({ handle: '', headline: '', linkedinUrl: '', githubUrl: '', youtubeUrl: '' })

function fill(value: InstructorProfile) {
  profile.value = value
  form.handle = value.handle
  form.headline = value.headline ?? ''
  form.linkedinUrl = value.linkedinUrl ?? ''
  form.githubUrl = value.githubUrl ?? ''
  form.youtubeUrl = value.youtubeUrl ?? ''
}

async function save() {
  saving.value = true
  try {
    // Empty strings clear a field on the server
    fill(await updateMine({
      handle: form.handle.trim().toLowerCase(),
      headline: form.headline.trim(),
      linkedinUrl: form.linkedinUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      youtubeUrl: form.youtubeUrl.trim()
    }))
    toast.success('Profile saved', 'Your public page is up to date.')
  } catch (err) {
    toast.error('Not saved', getErrorMessage(err, 'Unable to save your instructor profile'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    fill(await fetchMine())
  } catch (err) {
    loadError.value = getErrorMessage(err, 'Unable to load your instructor profile')
  } finally {
    pending.value = false
  }
})
</script>
