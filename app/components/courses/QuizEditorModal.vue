<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-[#05050c]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="$emit('close')">
        <div ref="dialogRef" class="max-h-[90dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-[20px] border border-violet-500/25 bg-[#0f1019] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] sm:p-6 light:border-slate-200 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="quiz-modal-title">
          <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4.5 light:border-slate-200">
            <div>
              <h2 id="quiz-modal-title" class="text-lg font-bold text-slate-50 light:text-slate-900">Quiz Questions</h2>
              <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ lessonTitle }}</p>
            </div>
            <button type="button" aria-label="Close" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-500" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>

          <div v-if="pending" class="mt-5 h-40 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />

          <form v-else class="mt-5 flex flex-col gap-4" @submit.prevent="save">
            <p v-if="error" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-300 light:border-red-200 light:bg-red-50 light:text-red-700" role="alert">{{ error }}</p>

            <div class="flex max-w-40 flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="quiz-pass-percent">Pass Mark (%)</label>
              <input id="quiz-pass-percent" v-model.number="passPercent" type="number" min="1" max="100" required :class="inputClass">
            </div>

            <div v-for="(question, questionIndex) in questions" :key="question.key" class="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-4 light:border-slate-200 light:bg-slate-50">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-white/60 light:text-slate-600">Question {{ questionIndex + 1 }}</span>
                <button type="button" :aria-label="`Delete question ${questionIndex + 1}`" class="flex size-7 cursor-pointer items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/10" @click="questions.splice(questionIndex, 1)">
                  <Trash2 :size="14" />
                </button>
              </div>
              <textarea v-model="question.prompt" required maxlength="1000" rows="2" placeholder="Question" :aria-label="`Question ${questionIndex + 1}`" :class="inputClass" />

              <p class="text-[11px] text-white/45 light:text-slate-500">Select the correct answer.</p>
              <div v-for="(option, optionIndex) in question.options" :key="option.key" class="flex items-center gap-2">
                <input
                  type="radio"
                  class="size-4 shrink-0 accent-violet-500"
                  :name="`correct-${question.key}`"
                  :aria-label="`Option ${optionIndex + 1} is correct`"
                  :checked="question.correctKey === option.key"
                  @change="question.correctKey = option.key"
                >
                <input v-model="option.text" type="text" required maxlength="500" :placeholder="`Option ${optionIndex + 1}`" :aria-label="`Option ${optionIndex + 1}`" :class="inputClass">
                <button type="button" :aria-label="`Delete option ${optionIndex + 1}`" class="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/40 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40 light:text-slate-400" :disabled="question.options.length <= 2" @click="removeOption(question, optionIndex)">
                  <X :size="14" />
                </button>
              </div>
              <button type="button" class="w-fit cursor-pointer text-xs font-semibold text-violet-300 disabled:cursor-not-allowed disabled:opacity-40 light:text-violet-700" :disabled="question.options.length >= 8" @click="question.options.push(newOption())">
                Add option
              </button>
              <textarea v-model="question.explanation" maxlength="2000" rows="2" placeholder="Explanation shown after passing (optional)" :aria-label="`Explanation for question ${questionIndex + 1}`" :class="inputClass" />
            </div>

            <button type="button" class="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-violet-300 light:text-violet-700" @click="questions.push(newQuestion())">
              <Plus :size="14" /> Add question
            </button>

            <div class="flex justify-end gap-2.5 border-t border-white/8 pt-4 light:border-slate-200">
              <button type="button" class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/70 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700" @click="$emit('close')">Cancel</button>
              <button type="submit" class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-wait disabled:opacity-60" :disabled="saving || !questions.length">
                <Loader2 v-if="saving" :size="14" class="animate-spin" /> Save Quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Loader2, Plus, Trash2, X } from 'lucide-vue-next'
import type { Lesson } from '~/types'
import { useAppToast } from '~/composables/useAppToast'
import { useModalA11y } from '~/composables/useModalA11y'
import { useQuiz } from '~/composables/useQuiz'
import { getErrorMessage } from '~/utils/apiError'

interface OptionDraft {
  key: number
  text: string
}

interface QuestionDraft {
  key: number
  prompt: string
  explanation: string
  options: OptionDraft[]
  correctKey: number | null
}

const props = defineProps<{ isOpen: boolean, lesson: Lesson | null }>()
const emit = defineEmits<{ close: [] }>()

const inputClass = 'w-full rounded-[10px] border border-white/9 bg-white/4 px-3 py-2 text-[13px] text-slate-100 outline-none placeholder:text-white/35 focus:border-violet-500/65 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'

const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const dialogRef = ref<HTMLElement | null>(null)
useModalA11y({
  isOpen: computed(() => props.isOpen),
  dialogRef,
  onClose: () => emit('close')
})

const { fetchAdminQuiz, saveQuiz } = useQuiz()
const toast = useAppToast()

const lessonTitle = computed(() => props.lesson?.title ?? '')
const pending = ref(false)
const saving = ref(false)
const error = ref('')
const passPercent = ref(70)
const questions = ref<QuestionDraft[]>([])
let nextKey = 0

function newOption(text = ''): OptionDraft {
  return { key: ++nextKey, text }
}

function newQuestion(): QuestionDraft {
  return { key: ++nextKey, prompt: '', explanation: '', options: [newOption(), newOption()], correctKey: null }
}

function removeOption(question: QuestionDraft, index: number) {
  const [removed] = question.options.splice(index, 1)
  if (removed && question.correctKey === removed.key) question.correctKey = null
}

watch(() => props.isOpen, async (open) => {
  if (!open || !props.lesson) return
  pending.value = true
  error.value = ''
  try {
    const quiz = await fetchAdminQuiz(props.lesson.id)
    passPercent.value = quiz.passPercent
    questions.value = quiz.questions.map((question) => {
      const options = question.options.map(option => ({ ...newOption(option.text), correct: option.correct }))
      return {
        key: ++nextKey,
        prompt: question.prompt,
        explanation: question.explanation ?? '',
        options,
        correctKey: options.find(option => option.correct)?.key ?? null
      }
    })
    if (!questions.value.length) questions.value = [newQuestion()]
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to load this quiz')
  } finally {
    pending.value = false
  }
})

async function save() {
  if (!props.lesson) return
  const unanswered = questions.value.findIndex(question => question.correctKey === null)
  if (unanswered !== -1) {
    error.value = `Select the correct answer for question ${unanswered + 1}.`
    return
  }

  saving.value = true
  error.value = ''
  try {
    await saveQuiz(props.lesson.id, {
      passPercent: passPercent.value,
      questions: questions.value.map(question => ({
        prompt: question.prompt,
        explanation: question.explanation || null,
        options: question.options.map(option => ({ text: option.text, correct: option.key === question.correctKey }))
      }))
    })
    toast.success('Quiz Saved', 'Learners must now pass it to complete this lesson.')
    emit('close')
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to save this quiz')
  } finally {
    saving.value = false
  }
}
</script>
