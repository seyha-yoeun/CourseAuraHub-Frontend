<template>
  <div v-if="pending" class="h-64 animate-pulse rounded-[20px] bg-white/5 light:bg-slate-100" />

  <p v-else-if="loadError" class="rounded-2xl border border-rose-500/25 bg-rose-500/8 px-5 py-6 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
    {{ loadError }}
  </p>

  <section v-else-if="quiz?.questions.length" class="rounded-[20px] border border-white/10 bg-white/5 p-5 sm:p-6 light:border-slate-200 light:bg-white">
    <div class="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 pb-4 light:border-slate-200">
      <div>
        <h2 class="flex items-center gap-2 text-base font-bold text-slate-100 light:text-slate-900">
          <HelpCircle :size="18" class="text-violet-400" /> {{ t('Quiz') }}
        </h2>
        <p class="mt-1 text-xs text-white/45 light:text-slate-500">
          {{ t('{count} questions · Pass mark {percent}%', { count: quiz.questions.length, percent: quiz.passPercent }) }}
        </p>
      </div>
      <p v-if="quiz.bestScore !== null" class="text-xs text-white/50 light:text-slate-500">
        {{ t('Best score {score}%', { score: quiz.bestScore }) }}
      </p>
    </div>

    <!-- Result -->
    <div
      v-if="result"
      class="mt-4 rounded-xl border px-4 py-3"
      :class="result.passed
        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700'
        : 'border-amber-400/30 bg-amber-500/10 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700'"
      role="status"
    >
      <p class="text-sm font-bold">
        {{ result.passed ? t('Passed with {score}%', { score: result.scorePercent }) : t('You scored {score}%', { score: result.scorePercent }) }}
      </p>
      <p class="mt-0.5 text-xs">
        {{ result.passed
          ? t('{correct} of {total} correct. This lesson is complete.', { correct: result.correctCount, total: result.totalCount })
          : t('{correct} of {total} correct. You need {percent}% to pass, so try again.', { correct: result.correctCount, total: result.totalCount, percent: result.passPercent }) }}
      </p>
    </div>

    <ol class="m-0 mt-4 flex list-none flex-col gap-5 p-0">
      <li v-for="(question, index) in quiz.questions" :key="question.id">
        <fieldset class="m-0 border-0 p-0">
          <legend class="p-0 text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ index + 1 }}. {{ question.prompt }}</legend>
          <div class="mt-2.5 flex flex-col gap-2">
            <label
              v-for="option in question.options"
              :key="option.id"
              class="flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] transition-colors"
              :class="[optionClass(question.id, option.id), result ? 'cursor-default' : 'cursor-pointer']"
            >
              <input
                v-model="answers[question.id]"
                type="radio"
                class="mt-0.5 size-4 accent-violet-500"
                :name="`question-${question.id}`"
                :value="option.id"
                :disabled="Boolean(result) || submitting"
              >
              <span>{{ option.text }}</span>
            </label>
          </div>
          <p v-if="resultFor(question.id)?.explanation" class="mt-2 text-xs text-white/55 light:text-slate-600">
            {{ resultFor(question.id)?.explanation }}
          </p>
        </fieldset>
      </li>
    </ol>

    <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4 light:border-slate-200">
      <p class="text-xs text-white/45 light:text-slate-500">
        {{ t('{answered} of {total} answered', { answered: answeredCount, total: quiz.questions.length }) }}
      </p>
      <button
        v-if="result"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700"
        @click="retake"
      >
        <RotateCcw :size="14" /> {{ t('Try again') }}
      </button>
      <button
        v-else
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting || answeredCount < quiz.questions.length"
        @click="submit"
      >
        <Loader2 v-if="submitting" :size="14" class="animate-spin" />
        {{ t('Submit answers') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { HelpCircle, Loader2, RotateCcw } from 'lucide-vue-next'
import type { LessonProgressResult, Quiz, QuizResult } from '~/types'
import { useAppToast } from '~/composables/useAppToast'
import { useQuiz } from '~/composables/useQuiz'
import { getErrorMessage } from '~/utils/apiError'

const props = defineProps<{ lessonId: number }>()

const emit = defineEmits<{
  // True when this quiz has questions to answer, false when it should fall back to its link
  ready: [graded: boolean]
  passed: [progress: LessonProgressResult]
}>()

const { t } = useT()
const toast = useAppToast()
const { fetchQuiz, submitQuiz } = useQuiz()

const quiz = ref<Quiz | null>(null)
const pending = ref(true)
const loadError = ref('')
const answers = ref<Record<number, number>>({})
const result = ref<QuizResult | null>(null)
const submitting = ref(false)

const answeredCount = computed(() => quiz.value?.questions.filter(question => answers.value[question.id] !== undefined).length ?? 0)

function resultFor(questionId: number) {
  return result.value?.questions.find(question => question.questionId === questionId)
}

function optionClass(questionId: number, optionId: number) {
  const graded = resultFor(questionId)
  const chosen = answers.value[questionId] === optionId
  if (graded?.correctOptionId === optionId) {
    return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-800'
  }
  if (graded && chosen && !graded.correct) {
    return 'border-rose-400/40 bg-rose-500/10 text-rose-200 light:border-rose-300 light:bg-rose-50 light:text-rose-800'
  }
  if (chosen) {
    return 'border-violet-500/50 bg-violet-500/12 text-slate-100 light:border-violet-300 light:bg-violet-50 light:text-slate-900'
  }
  return 'border-white/8 bg-white/3 text-white/75 hover:border-white/15 light:border-slate-200 light:bg-white light:text-slate-700'
}

async function submit() {
  submitting.value = true
  try {
    const outcome = await submitQuiz(props.lessonId, answers.value)
    result.value = outcome
    if (quiz.value) {
      quiz.value.attempts += 1
      quiz.value.bestScore = Math.max(quiz.value.bestScore ?? 0, outcome.scorePercent)
      quiz.value.passed = quiz.value.passed || outcome.passed
    }
    if (outcome.progress) emit('passed', outcome.progress)
  } catch (err) {
    toast.error(t('Quiz not submitted'), getErrorMessage(err, t('Please try again.')))
  } finally {
    submitting.value = false
  }
}

function retake() {
  result.value = null
  answers.value = {}
}

onMounted(async () => {
  try {
    quiz.value = await fetchQuiz(props.lessonId)
    emit('ready', quiz.value.questions.length > 0)
  } catch (err) {
    loadError.value = getErrorMessage(err, t('Unable to load this quiz'))
    emit('ready', true)
  } finally {
    pending.value = false
  }
})
</script>
