<template>
  <section
    v-if="state"
    id="course-survey"
    :aria-label="t('Course feedback')"
    class="rounded-[18px] border border-blue-400/25 bg-blue-500/6 p-4 sm:p-5 light:border-blue-200 light:bg-blue-50/60"
  >
    <h2 class="flex items-center gap-2 text-sm font-bold text-slate-100 light:text-slate-900">
      <MessageSquareText :size="16" class="text-blue-400" /> {{ t('How is the course going?') }}
    </h2>

    <p v-if="state === 'thanks'" class="mt-2 text-[13px] text-white/70 light:text-slate-600">{{ t('Thanks for your feedback! It helps us improve the course.') }}</p>
    <p v-else-if="state === 'answered'" class="mt-2 text-[13px] text-white/60 light:text-slate-600">{{ t('You already answered this course\'s survey. Thank you!') }}</p>
    <p v-else-if="state === 'early'" class="mt-2 text-[13px] text-white/60 light:text-slate-600">
      {{ survey?.survey.trigger === 'completion' ? t('You\'ll be asked for feedback when you finish the course.') : t('You\'ll be asked for feedback once you\'re halfway through.') }}
    </p>

    <form v-else-if="survey" class="mt-3 flex flex-col gap-4" @submit.prevent="submit">
      <p class="-mt-1 text-xs text-white/50 light:text-slate-500">{{ t('Two minutes of feedback helps us improve it.') }}</p>

      <fieldset>
        <legend class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ survey.survey.recommendQuestion }} <span class="text-rose-400">*</span></legend>
        <div class="mt-2 flex flex-wrap gap-1.5" role="radiogroup">
          <button
            v-for="score in 11"
            :key="score"
            type="button"
            role="radio"
            :aria-checked="nps === score - 1"
            class="flex size-9 cursor-pointer items-center justify-center rounded-lg border text-[13px] font-semibold transition-colors"
            :class="nps === score - 1 ? 'border-brand-500 bg-brand-500 text-white' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 light:border-slate-200 light:bg-white light:text-slate-700'"
            @click="nps = score - 1"
          >
            {{ score - 1 }}
          </button>
        </div>
        <div class="mt-1 flex max-w-[27rem] justify-between text-[11px] text-white/40 light:text-slate-500">
          <span>{{ t('Not likely') }}</span><span>{{ t('Very likely') }}</span>
        </div>
      </fieldset>

      <fieldset v-for="question in survey.survey.questions" :key="question.id">
        <legend class="text-[13px] font-semibold text-slate-100 light:text-slate-900">
          {{ question.text }} <span v-if="question.required" class="text-rose-400">*</span>
        </legend>
        <div v-if="question.type === 'rating'" class="mt-2 flex gap-1" role="radiogroup">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            role="radio"
            :aria-checked="answers[question.id] === star"
            :aria-label="t('{count} out of 5', { count: star })"
            class="cursor-pointer p-0.5"
            @click="answers[question.id] = star"
          >
            <Star :size="24" :class="Number(answers[question.id] ?? 0) >= star ? 'fill-amber-400 text-amber-400' : 'text-white/25 light:text-slate-300'" />
          </button>
        </div>
        <div v-else-if="question.type === 'choice'" class="mt-2 flex flex-col gap-1.5">
          <label v-for="option in question.options ?? []" :key="option" class="flex cursor-pointer items-center gap-2 text-[13px] text-white/75 light:text-slate-700">
            <input v-model="answers[question.id]" type="radio" :name="`survey-${question.id}`" :value="option" class="accent-brand-500">
            {{ option }}
          </label>
        </div>
        <textarea v-else v-model="answers[question.id]" rows="3" maxlength="2000" :aria-label="question.text" class="mt-2" :class="inputClass" />
      </fieldset>

      <div>
        <button type="submit" :class="primaryButton" :disabled="sending || !complete">
          <Loader2 v-if="sending" :size="15" class="animate-spin" />
          {{ t('Send feedback') }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Loader2, MessageSquareText, Star } from 'lucide-vue-next'
import type { LearnerSurvey } from '~/types/survey'
import { useAppToast } from '~/composables/useAppToast'
import { useSurveys } from '~/composables/useSurveys'
import { getErrorMessage } from '~/utils/apiError'
import { inputClass, primaryButton } from '~/utils/ui'

/**
 * The course survey for an enrolled learner, shown once they reach its point in the course. The survey
 * notification links here with ?survey=1 (`focus`), which scrolls to it and explains why it isn't shown yet.
 */
const props = defineProps<{ slug: string, focus?: boolean, progressKey?: number | null }>()

const { t } = useT()
const toast = useAppToast()
const { fetchForLearner, answerSurvey } = useSurveys()

const survey = ref<LearnerSurvey | null>(null)
const nps = ref<number | null>(null)
const answers = reactive<Record<string, string | number>>({})
const sending = ref(false)
const sent = ref(false)

const state = computed(() => {
  if (sent.value) return 'thanks'
  const current = survey.value
  if (!current || !current.survey.active) return null
  if (current.answered) return props.focus ? 'answered' : null
  if (!current.eligible) return props.focus ? 'early' : null
  return 'form'
})

const complete = computed(() => nps.value !== null && (survey.value?.survey.questions ?? [])
  .every(question => !question.required || String(answers[question.id] ?? '').trim()))

async function load() {
  // No survey (404) or not enrolled: the card stays hidden
  survey.value = await fetchForLearner(props.slug).catch(() => null)
  if (props.focus && state.value) {
    await nextTick()
    document.getElementById('course-survey')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

async function submit() {
  if (nps.value === null) return
  const filled = Object.fromEntries(Object.entries(answers)
    .map(([id, value]) => [id, typeof value === 'string' ? value.trim() : value])
    .filter(([, value]) => value !== ''))
  sending.value = true
  try {
    await answerSurvey(props.slug, { npsScore: nps.value, answers: filled })
    sent.value = true
  } catch (err) {
    toast.error(t('Feedback not sent'), getErrorMessage(err, t('Please try again.')))
  } finally {
    sending.value = false
  }
}

// Completing lessons can make the learner eligible
watch(() => [props.slug, props.progressKey], load, { immediate: true })
</script>
