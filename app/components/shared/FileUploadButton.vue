<template>
  <div class="inline-flex items-center gap-2.5">
    <input ref="inputRef" type="file" class="hidden" :accept="accept" @change="handleFile">
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
      :disabled="busy"
      @click="inputRef?.click()"
    >
      <Loader2 v-if="busy" :size="14" class="animate-spin" />
      <Upload v-else :size="14" />
      {{ busy ? t('Uploading {percent}%', { percent: progress }) : t(label) }}
    </button>
    <span v-if="hint" class="text-[11px] text-white/40 light:text-slate-500">{{ t(hint) }}</span>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Upload } from 'lucide-vue-next'
import type { FilePurpose, StoredFile } from '~/types'
import { useAppToast } from '~/composables/useAppToast'
import { useFileUpload } from '~/composables/useFileUpload'
import { useT } from '~/composables/useT'
import { toApiError } from '~/utils/apiError'

const props = withDefaults(defineProps<{
  purpose: FilePurpose
  accept: string
  label?: string
  hint?: string
}>(), {
  label: 'Upload file',
  hint: ''
})

const emit = defineEmits<{
  (e: 'uploaded', file: StoredFile): void
}>()

// Lets the form hold its save button until the file is in place
const busy = defineModel<boolean>('busy', { default: false })

const { t } = useT()
const { upload } = useFileUpload()
const toast = useAppToast()

const inputRef = ref<HTMLInputElement | null>(null)
const progress = ref(0)

async function handleFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Clearing it lets the same file be picked again after a failure
  input.value = ''
  if (!file) return

  busy.value = true
  progress.value = 0
  try {
    const stored = await upload(file, props.purpose, (percent) => { progress.value = percent })
    emit('uploaded', stored)
    toast.success(t('File uploaded'), t('Save to keep this change.'))
  } catch (err) {
    toast.error(t('Upload failed'), toApiError(err, t('The file could not be uploaded')).message)
  } finally {
    busy.value = false
  }
}
</script>
