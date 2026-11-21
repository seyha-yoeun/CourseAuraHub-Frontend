<template>
  <button type="button" :class="iconButtonClass" :aria-label="`Captions for ${lesson.title}`" title="Captions and stream" @click="open">
    <Captions :size="13" />
  </button>

  <PromptModal
    :is-open="isOpen"
    :title="`Captions · ${lesson.title}`"
    description="Learners pick a caption track in the player, and the text also shows as the lesson's transcript. One WebVTT file per language."
    :show-input="false"
    confirm-label="Done"
    @close="isOpen = false"
    @confirm="isOpen = false"
  >
    <div class="mt-4 flex flex-col gap-4">
      <p v-if="media?.status" class="text-xs" :class="statusClass">{{ statusText }}</p>

      <div>
        <p :class="labelClass">Caption tracks</p>
        <div v-if="loading" class="h-10 animate-pulse rounded-[10px] bg-white/5 light:bg-slate-100" />
        <p v-else-if="!media?.captions.length" class="text-xs text-white/45 light:text-slate-500">No captions yet.</p>
        <ul v-else class="m-0 flex list-none flex-col gap-1.5 p-0">
          <li v-for="caption in media.captions" :key="caption.language" class="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-[13px] light:border-slate-200 light:bg-slate-50">
            <span class="text-slate-100 light:text-slate-900">{{ caption.label }} <span class="font-mono text-xs text-white/45 light:text-slate-500">{{ caption.language }}</span></span>
            <button type="button" :class="dangerAction" :disabled="busy" @click="remove(caption.language)">Remove</button>
          </li>
        </ul>
      </div>

      <div class="rounded-xl border border-white/8 p-3 light:border-slate-200">
        <p class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Add or replace a language</p>
        <div class="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <label :class="labelClass" :for="`${uid}-lang`">Language code</label>
            <input :id="`${uid}-lang`" v-model="lang" type="text" maxlength="10" placeholder="en" :class="inputClass">
          </div>
          <div>
            <label :class="labelClass" :for="`${uid}-label`">Label</label>
            <input :id="`${uid}-label`" v-model="label" type="text" maxlength="50" placeholder="English" :class="inputClass">
          </div>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <FileUploadButton v-model:busy="uploading" purpose="LESSON_CAPTION" accept=".vtt,text/vtt" label="Upload .vtt file" @uploaded="file = $event" />
          <span v-if="file" class="text-xs text-white/50 light:text-slate-500">{{ file.fileName }}</span>
          <button type="button" class="ml-auto" :class="primaryAction" :disabled="busy || uploading || !file || !lang.trim() || !label.trim()" @click="save">Save captions</button>
        </div>
      </div>
    </div>
  </PromptModal>
</template>

<script setup lang="ts">
import { Captions } from 'lucide-vue-next'
import type { Lesson, StoredFile } from '~/types'
import type { LessonMedia } from '~/types/video'
import FileUploadButton from '~/components/shared/FileUploadButton.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useVideo } from '~/composables/useVideo'
import { getErrorMessage } from '~/utils/apiError'
import { dangerAction, inputClass, labelClass, primaryAction } from '~/utils/ui'

/** A curriculum row button: a video lesson's caption tracks and the state of its HLS stream. */
const props = defineProps<{ slug: string, lesson: Lesson }>()

const toast = useAppToast()
const uid = `captions-${useId()}`
const { fetchMedia, saveCaption, deleteCaption } = useVideo()

const iconButtonClass = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900'

const isOpen = ref(false)
const media = ref<LessonMedia | null>(null)
const loading = ref(false)
const busy = ref(false)
const uploading = ref(false)
const lang = ref('en')
const label = ref('English')
const file = ref<StoredFile | null>(null)

const statusText = computed(() => ({
  ready: 'Adaptive stream ready: learners get the best quality for their connection.',
  processing: 'The video is being converted to an adaptive stream. Learners see the original file meanwhile.',
  failed: 'The video couldn\'t be converted, so learners get the original file.',
} as const)[media.value?.status ?? 'ready'] ?? '')
const statusClass = computed(() => media.value?.status === 'failed'
  ? 'text-rose-400'
  : media.value?.status === 'processing' ? 'text-amber-400 light:text-amber-700' : 'text-emerald-400 light:text-emerald-700')

async function load() {
  loading.value = true
  media.value = await fetchMedia(props.lesson.id).catch(() => null)
  loading.value = false
}

function open() {
  isOpen.value = true
  file.value = null
  load()
}

async function save() {
  if (!file.value) return
  busy.value = true
  try {
    await saveCaption(props.slug, props.lesson.id, lang.value.trim().toLowerCase(), file.value.url, label.value.trim())
    toast.success('Captions Saved', label.value.trim())
    file.value = null
    await load()
  } catch (err) {
    toast.error('Captions Not Saved', getErrorMessage(err, 'Unable to save the captions'))
  } finally {
    busy.value = false
  }
}

async function remove(language: string) {
  busy.value = true
  try {
    await deleteCaption(props.slug, props.lesson.id, language)
    toast.info('Captions Removed', language)
    await load()
  } catch (err) {
    toast.error('Captions Not Removed', getErrorMessage(err, 'Unable to remove the captions'))
  } finally {
    busy.value = false
  }
}
</script>
