<template>
  <section class="rounded-[18px] border border-white/10 bg-white/5 light:border-slate-200 light:bg-white">
    <button
      type="button"
      class="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="flex items-center gap-2 text-[13px] font-bold text-slate-100 light:text-slate-900">
        <ScrollText :size="15" class="text-violet-400" /> {{ t('Transcript') }}
      </span>
      <ChevronDown :size="16" class="text-white/45 transition-transform light:text-slate-500" :class="open ? 'rotate-180' : ''" />
    </button>

    <div v-if="open" class="border-t border-white/8 px-5 pt-3 pb-4 light:border-slate-200">
      <div v-if="captions.length > 1" class="mb-3 w-full sm:w-48">
        <AppDropdown
          :model-value="lang"
          :options="captions.map(caption => ({ value: caption.language, label: caption.label }))"
          size="sm"
          :aria-label="t('Transcript language')"
          @update:model-value="value => lang = String(value)"
        />
      </div>
      <div v-if="loading" class="h-24 animate-pulse rounded-[10px] bg-white/5 light:bg-slate-100" />
      <p v-else-if="failed" class="text-xs text-white/50 light:text-slate-500">{{ t('Unable to load the transcript') }}</p>
      <p v-else class="max-h-72 overflow-y-auto text-[13px] leading-relaxed whitespace-pre-line text-white/75 light:text-slate-700">{{ text }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown, ScrollText } from 'lucide-vue-next'
import type { LessonCaption } from '~/types/video'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useVideo } from '~/composables/useVideo'

/** The spoken text of a video lesson, from its captions. Loaded only when opened. */
const props = defineProps<{ lessonId: number, captions: LessonCaption[] }>()

const { t } = useT()
const { fetchTranscript } = useVideo()

const open = ref(false)
const lang = ref(props.captions[0]?.language ?? 'en')
const text = ref('')
const loading = ref(false)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    text.value = (await fetchTranscript(props.lessonId, lang.value)).text
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value && !text.value) load()
}

watch(lang, () => {
  if (open.value) load()
})
</script>
