<template>
  <button type="button" :class="iconButtonClass" :aria-label="`Study text for ${lesson.title}`" title="AI assistant study text" @click="isOpen = true">
    <Sparkles :size="13" />
  </button>

  <PromptModal
    :is-open="isOpen"
    :title="`Study text · ${lesson.title}`"
    description="The AI assistant answers learners' questions and writes summaries from this text, such as the article or the video's transcript. Saving replaces the text saved before."
    label="Lesson text"
    placeholder="Paste the lesson's full text"
    required
    :maxlength="150000"
    :rows="12"
    confirm-label="Save Study Text"
    :loading="saving"
    @close="isOpen = false"
    @confirm="save"
  />
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import type { Lesson } from '~/types'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useAssistant } from '~/composables/useAssistant'
import { getErrorMessage } from '~/utils/apiError'

/** A curriculum row button: the text the AI study assistant answers from for this lesson. */
const props = defineProps<{ lesson: Lesson }>()

const toast = useAppToast()
const { saveSource } = useAssistant()

const iconButtonClass = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900'

const isOpen = ref(false)
const saving = ref(false)

async function save(text: string) {
  saving.value = true
  try {
    const source = await saveSource(props.lesson.id, text)
    isOpen.value = false
    toast.success('Study Text Saved', `${source.characters.toLocaleString()} characters for ${props.lesson.title}`)
  } catch (err) {
    toast.error('Study Text Not Saved', getErrorMessage(err, 'Unable to save the study text'))
  } finally {
    saving.value = false
  }
}
</script>
