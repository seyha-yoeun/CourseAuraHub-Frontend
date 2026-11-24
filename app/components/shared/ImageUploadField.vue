<template>
  <!--
    Image picker that shows the picture, never the storage URL: click or drop an image onto the preview,
    see it at once with upload progress, then Change or Remove it. The v-model is the stored URL.
  -->
  <div class="flex items-center gap-4" :class="shape === 'wide' && 'flex-col items-start sm:flex-row sm:items-center'">
    <input ref="inputRef" type="file" class="hidden" :accept="ACCEPT" @change="onPicked">

    <button
      type="button"
      class="group relative shrink-0 cursor-pointer overflow-hidden border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-wait light:focus-visible:ring-offset-white"
      :class="[
        shape === 'circle' ? 'size-20 rounded-full' : 'aspect-video w-56 rounded-xl',
        dragging
          ? 'border-brand-400 bg-brand-500/10 light:border-brand-500 light:bg-brand-50'
          : previewSrc ? 'border-transparent' : 'border-white/20 bg-white/[0.03] hover:border-brand-400/60 light:border-slate-300 light:bg-slate-50 light:hover:border-brand-500',
      ]"
      :disabled="busy"
      :aria-label="previewSrc ? t('Change image') : t('Upload image')"
      @click="inputRef?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDropped"
    >
      <img v-if="previewSrc" :src="previewSrc" alt="" class="size-full object-cover" @error="imageBroken = true">
      <span v-else class="flex size-full flex-col items-center justify-center gap-1 text-white/45 light:text-slate-400">
        <ImagePlus :size="shape === 'circle' ? 22 : 26" aria-hidden="true" />
        <span v-if="shape === 'wide'" class="text-[12px] font-medium">{{ t('Click or drop an image') }}</span>
      </span>

      <!-- Hover hint on an existing image -->
      <span
        v-if="previewSrc && !busy"
        class="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        <Camera :size="20" />
      </span>

      <!-- Upload progress -->
      <span v-if="busy" class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white" aria-hidden="true">
        <Loader2 :size="18" class="animate-spin" />
        <span class="text-[11px] font-semibold tabular-nums">{{ progress }}%</span>
      </span>
    </button>

    <div class="min-w-0 flex-1">
      <slot />

      <div class="flex flex-wrap items-center gap-2" :class="$slots.default && 'mt-2.5'">
        <button type="button" :class="secondaryButton" :disabled="busy" @click="inputRef?.click()">
          <Upload :size="14" aria-hidden="true" />
          {{ modelValue ? t(changeLabel) : t(uploadLabel) }}
        </button>
        <button
          v-if="modelValue && !busy"
          type="button"
          class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-white/55 transition-colors hover:bg-white/6 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-negative"
          @click="remove"
        >
          <Trash2 :size="14" aria-hidden="true" />
          {{ t('Remove') }}
        </button>
      </div>

      <p class="mt-1.5 text-[12px] text-white/40 light:text-slate-500">{{ t('JPG, PNG or WebP, up to {size} MB. You can also drag an image onto the preview.', { size: MAX_MB }) }}</p>
      <p v-if="error" class="mt-1 text-[12px] text-rose-300 light:text-negative" role="alert">{{ error }}</p>
      <p v-else-if="unsaved" class="mt-1 inline-flex items-center gap-1 text-[12px] text-amber-300 light:text-warning" aria-live="polite">
        <CircleDot :size="12" aria-hidden="true" /> {{ t('Not saved yet — save to keep this change.') }}
      </p>

      <!-- Optional: an external image link instead of an upload (e.g. course thumbnails) -->
      <template v-if="allowLink">
        <button
          v-if="!showLink"
          type="button"
          class="mt-2 cursor-pointer text-[12.5px] font-medium text-brand-300 hover:underline light:text-brand-600"
          @click="showLink = true"
        >
          {{ t('Use an image link instead') }}
        </button>
        <input
          v-else
          :value="modelValue"
          type="url"
          maxlength="1000"
          placeholder="https://"
          :aria-label="t('Image link')"
          class="mt-2 h-9 w-full rounded-[10px] border border-white/10 bg-white/4 px-3 text-[13px] text-slate-100 outline-none placeholder:text-white/30 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value.trim())"
        >
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Camera, CircleDot, ImagePlus, Loader2, Trash2, Upload } from 'lucide-vue-next'
import type { FilePurpose } from '~/types'
import { useFileUpload } from '~/composables/useFileUpload'
import { toApiError } from '~/utils/apiError'

// Matches the backend limits for AVATAR and COURSE_THUMBNAIL (file/model/FilePurpose.java)
const ACCEPT = 'image/jpeg,image/png,image/webp'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 5

const props = withDefaults(defineProps<{
  /** The stored image URL ('' when none) */
  modelValue: string
  purpose: FilePurpose
  shape?: 'circle' | 'wide'
  /** Shown when there is no image of our own, e.g. the generated avatar */
  fallback?: string
  /** The value currently saved, to flag unsaved changes */
  savedValue?: string
  allowLink?: boolean
  uploadLabel?: string
  changeLabel?: string
}>(), {
  shape: 'circle',
  fallback: undefined,
  savedValue: undefined,
  allowLink: false,
  uploadLabel: 'Upload image',
  changeLabel: 'Change image',
})

const emit = defineEmits<{
  'update:modelValue': [url: string]
}>()

// Lets the form hold its save button until the file is in place
const busy = defineModel<boolean>('busy', { default: false })

const { t } = useT()
const { upload } = useFileUpload()

const inputRef = ref<HTMLInputElement | null>(null)
const progress = ref(0)
const dragging = ref(false)
const error = ref('')
const showLink = ref(false)
const localPreview = ref<string | null>(null)
const imageBroken = ref(false)

const secondaryButton = 'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-[12.5px] font-semibold text-white/80 transition-colors hover:bg-white/9 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait disabled:opacity-60 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50 light:hover:text-slate-900'

// While uploading, show the picked file itself; afterwards the stored image (or the fallback)
const previewSrc = computed(() => {
  if (localPreview.value) return localPreview.value
  if (props.modelValue && !imageBroken.value) return props.modelValue
  return props.fallback || ''
})

const unsaved = computed(() => props.savedValue !== undefined && !busy.value && props.modelValue !== props.savedValue)

watch(() => props.modelValue, () => {
  imageBroken.value = false
})

function validate(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) return t('Choose a JPG, PNG or WebP image.')
  if (file.size > MAX_MB * 1024 * 1024) return t('This image is larger than {size} MB. Choose a smaller one.', { size: MAX_MB })
  return ''
}

async function handle(file: File | undefined) {
  if (!file || busy.value) return
  error.value = validate(file)
  if (error.value) return

  localPreview.value = URL.createObjectURL(file)
  busy.value = true
  progress.value = 0
  try {
    const stored = await upload(file, props.purpose, (percent) => { progress.value = percent })
    emit('update:modelValue', stored.url)
  } catch (err) {
    error.value = toApiError(err, t('The image could not be uploaded. Please try again.')).message
  } finally {
    busy.value = false
    if (localPreview.value) URL.revokeObjectURL(localPreview.value)
    localPreview.value = null
  }
}

function onPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Clearing it lets the same file be picked again after a failure
  input.value = ''
  handle(file)
}

function onDropped(event: DragEvent) {
  dragging.value = false
  handle(event.dataTransfer?.files?.[0])
}

function remove() {
  error.value = ''
  emit('update:modelValue', '')
}

onBeforeUnmount(() => {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
})
</script>
