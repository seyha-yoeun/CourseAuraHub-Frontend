<template>
  <section :class="cardClass">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 :class="sectionTitle">Feedback Survey</h2>
        <p class="mt-1 text-xs text-white/45 light:text-slate-500">Learners answer once, halfway through or at the end. A 0-10 "would you recommend it?" question is always asked.</p>
      </div>
      <span v-if="survey" class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="survey.active ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700' : 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'">
        {{ survey.active ? 'Asking learners' : 'Paused' }}
      </span>
    </div>

    <div v-if="pending" class="mt-3 h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" class="mt-3 text-xs text-rose-400">{{ getErrorMessage(error, 'Unable to load the survey') }}</p>

    <div v-else-if="!survey && !editing" class="mt-3 flex flex-wrap items-center gap-3">
      <p class="text-xs text-white/45 light:text-slate-500">This course has no survey.</p>
      <button type="button" :class="primaryAction" @click="startEditing">Create Survey</button>
    </div>

    <template v-else>
      <div v-if="survey && !editing" class="mt-3 flex gap-1 border-b border-white/8 pb-3 light:border-slate-200" role="tablist">
        <button
          v-for="item in tabs"
          :key="item.value"
          type="button"
          role="tab"
          :aria-selected="tab === item.value"
          class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          :class="tab === item.value ? 'bg-violet-600 text-white' : 'text-white/60 hover:text-white light:text-slate-600 light:hover:text-slate-900'"
          @click="tab = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <!-- Editor -->
      <form v-if="editing" class="mt-4 flex flex-col gap-4" @submit.prevent="save">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <span :class="labelClass">Ask learners</span>
            <AppDropdown :model-value="form.trigger" :options="triggerOptions" aria-label="When learners are asked" @update:model-value="value => form.trigger = value as SurveyTrigger" />
          </div>
          <label class="flex items-center gap-2 self-end pb-2.5 text-[13px] text-slate-100 light:text-slate-900">
            <input v-model="form.active" type="checkbox" class="accent-violet-500">
            Ask learners now (turn off to pause and keep responses)
          </label>
        </div>

        <p v-if="survey" class="text-[11px] text-amber-400 light:text-amber-700">
          Answers are matched to questions by position. Removing or reordering questions after responses come in mixes up the results.
        </p>

        <ol class="m-0 flex list-none flex-col gap-3 p-0">
          <li v-for="(question, index) in form.questions" :key="index" class="rounded-xl border border-white/8 bg-white/3 p-3.5 light:border-slate-200 light:bg-slate-50">
            <div class="flex flex-wrap items-start gap-2">
              <span class="mt-2.5 text-xs font-bold text-white/40 light:text-slate-400">{{ index + 1 }}.</span>
              <input v-model="question.text" type="text" maxlength="300" required placeholder="Question" :aria-label="`Question ${index + 1}`" class="min-w-48 flex-1" :class="inputClass">
              <div class="w-36">
                <AppDropdown :model-value="question.type" :options="typeOptions" size="sm" :aria-label="`Question ${index + 1} type`" @update:model-value="value => setType(question, value as SurveyQuestionType)" />
              </div>
              <button type="button" :class="dangerAction" class="mt-1" :aria-label="`Remove question ${index + 1}`" @click="form.questions.splice(index, 1)">
                <Trash2 :size="14" />
              </button>
            </div>
            <div v-if="question.type === 'choice'" class="mt-2 pl-5">
              <label :class="labelClass" :for="`${uid}-options-${index}`">Options, one per line (2 to 8)</label>
              <textarea :id="`${uid}-options-${index}`" :value="(question.options ?? []).join('\n')" rows="3" :class="inputClass" @input="setOptions(question, ($event.target as HTMLTextAreaElement).value)" />
            </div>
            <label class="mt-2 flex items-center gap-2 pl-5 text-xs text-white/60 light:text-slate-600">
              <input v-model="question.required" type="checkbox" class="accent-violet-500"> Required
            </label>
          </li>
        </ol>

        <div class="flex flex-wrap items-center gap-2">
          <button type="button" :class="neutralAction" :disabled="form.questions.length >= 10" @click="addQuestion">
            <span class="inline-flex items-center gap-1.5"><Plus :size="13" /> Add question</span>
          </button>
          <span class="text-[11px] text-white/40 light:text-slate-500">{{ form.questions.length }}/10</span>
          <div class="ml-auto flex items-center gap-2">
            <button type="button" :class="neutralAction" :disabled="saving" @click="editing = false">Cancel</button>
            <button type="submit" :class="primaryAction" :disabled="saving || !canSave">Save Survey</button>
          </div>
        </div>
      </form>

      <!-- Setup summary -->
      <div v-else-if="survey && tab === 'setup'" class="mt-4 flex flex-col gap-3">
        <p class="text-xs text-white/55 light:text-slate-500">Asked {{ survey.trigger === 'completion' ? 'when a learner finishes the course' : 'once a learner is halfway through' }}.</p>
        <ol class="m-0 flex list-decimal flex-col gap-1.5 pl-5 text-[13px] text-slate-100 light:text-slate-900">
          <li>{{ survey.recommendQuestion }} <span class="text-xs text-white/40 light:text-slate-500">(0-10, required)</span></li>
          <li v-for="question in survey.questions" :key="question.id">
            {{ question.text }}
            <span class="text-xs text-white/40 light:text-slate-500">({{ typeLabel(question.type) }}{{ question.required ? ', required' : '' }})</span>
          </li>
        </ol>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" :class="primaryAction" @click="startEditing">Edit</button>
          <button type="button" :class="neutralAction" :disabled="saving" @click="toggleActive">{{ survey.active ? 'Pause' : 'Resume' }}</button>
          <button type="button" :class="dangerAction" @click="deleting = true">Delete</button>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="survey" class="mt-4">
        <div v-if="resultsPending" class="h-24 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
        <p v-else-if="!results" class="text-xs text-white/45 light:text-slate-500">Unable to load the results.</p>
        <p v-else-if="!results.responses" class="text-xs text-white/45 light:text-slate-500">No responses yet.</p>
        <div v-else class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-5">
            <div>
              <p class="text-[11px] font-semibold tracking-wider text-white/40 uppercase light:text-slate-500">Net Promoter Score</p>
              <p class="text-3xl font-extrabold" :class="npsClass(results.nps.score)">{{ results.nps.score ?? '—' }}</p>
              <p class="text-[11px] text-white/40 light:text-slate-500">{{ results.responses }} {{ results.responses === 1 ? 'response' : 'responses' }}</p>
            </div>
            <div class="min-w-60 flex-1">
              <div class="flex h-3 overflow-hidden rounded-full bg-white/8 light:bg-slate-100">
                <span class="bg-emerald-500" :style="{ width: share(results.nps.promoters) }" />
                <span class="bg-amber-400" :style="{ width: share(results.nps.passives) }" />
                <span class="bg-rose-500" :style="{ width: share(results.nps.detractors) }" />
              </div>
              <div class="mt-1.5 flex flex-wrap gap-x-4 text-[11px] text-white/55 light:text-slate-500">
                <span><span class="mr-1 inline-block size-2 rounded-full bg-emerald-500" />Promoters (9-10): {{ results.nps.promoters }}</span>
                <span><span class="mr-1 inline-block size-2 rounded-full bg-amber-400" />Passives (7-8): {{ results.nps.passives }}</span>
                <span><span class="mr-1 inline-block size-2 rounded-full bg-rose-500" />Detractors (0-6): {{ results.nps.detractors }}</span>
              </div>
            </div>
          </div>

          <div v-for="question in results.questions" :key="question.id" class="border-t border-white/8 pt-3 light:border-slate-200">
            <p class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ question.text }}</p>
            <p class="text-[11px] text-white/40 light:text-slate-500">
              {{ question.answered }} answered<template v-if="question.average !== null"> · average {{ Number(question.average).toFixed(1) }} / 5</template>
            </p>
            <ul v-if="question.distribution && question.type !== 'text'" class="m-0 mt-2 flex list-none flex-col gap-1 p-0">
              <li v-for="(count, label) in question.distribution" :key="label" class="flex items-center gap-2 text-xs">
                <span class="w-28 shrink-0 truncate text-white/60 light:text-slate-600">{{ question.type === 'rating' ? `${label} ★` : label }}</span>
                <span class="h-2 flex-1 overflow-hidden rounded-full bg-white/8 light:bg-slate-100">
                  <span class="block h-full rounded-full bg-violet-500" :style="{ width: question.answered ? `${(count / question.answered) * 100}%` : '0%' }" />
                </span>
                <span class="w-8 text-right text-white/55 light:text-slate-500">{{ count }}</span>
              </li>
            </ul>
            <ul v-if="question.comments?.length" class="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
              <li v-for="(comment, index) in question.comments" :key="index" class="rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-xs whitespace-pre-line text-white/70 light:border-slate-200 light:bg-slate-50 light:text-slate-600">{{ comment }}</li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <ConfirmDeleteModal
      :is-open="deleting"
      title="Delete Survey"
      description="Its responses are deleted too. Pause it instead to stop asking and keep them."
      item-name="Feedback survey"
      :loading="saving"
      @close="deleting = false"
      @confirm="remove"
    />
  </section>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { CourseSurveyForm, SurveyQuestionForm, SurveyQuestionType, SurveyResults, SurveyTrigger } from '~/types/survey'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useSurveys } from '~/composables/useSurveys'
import { getErrorMessage } from '~/utils/apiError'
import { cardClass, dangerAction, inputClass, labelClass, neutralAction, primaryAction, sectionTitle } from '~/utils/ui'

/** Course staff set up the course's feedback survey and read its results (aggregates, never who said what). */
const props = defineProps<{ slug: string }>()

const toast = useAppToast()
const uid = `survey-${useId()}`
const { fetchSurvey, saveSurvey, deleteSurvey, fetchResults } = useSurveys()

const { data: survey, pending, error } = await useAsyncData(
  () => `survey-${props.slug}`,
  () => fetchSurvey(props.slug),
  { server: false, watch: [() => props.slug] },
)

const tabs = [
  { value: 'setup', label: 'Setup' },
  { value: 'results', label: 'Results' },
] as const
const tab = ref<'setup' | 'results'>('setup')
const results = ref<SurveyResults | null>(null)
const resultsPending = ref(false)

watch(tab, async (value) => {
  if (value !== 'results') return
  resultsPending.value = true
  results.value = await fetchResults(props.slug).catch(() => null)
  resultsPending.value = false
})

const triggerOptions = [
  { value: 'percent_50', label: 'Halfway through' },
  { value: 'completion', label: 'When they finish' },
]
const typeOptions = [
  { value: 'rating', label: 'Rating 1-5' },
  { value: 'choice', label: 'Choice' },
  { value: 'text', label: 'Text' },
]
function typeLabel(type: SurveyQuestionType) {
  return typeOptions.find(option => option.value === type)?.label ?? type
}

const editing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const form = reactive<CourseSurveyForm>({ trigger: 'completion', active: true, questions: [] })

const canSave = computed(() => form.questions.every(question => question.text.trim()
  && (question.type !== 'choice' || new Set(question.options ?? []).size >= 2)))

function startEditing() {
  const current = survey.value
  form.trigger = current?.trigger ?? 'completion'
  form.active = current?.active ?? true
  form.questions = current
    ? current.questions.map(q => ({ text: q.text, type: q.type, options: q.options ? [...q.options] : null, required: q.required }))
    : [{ text: 'What did you like most?', type: 'text', options: null, required: false }]
  editing.value = true
}

function addQuestion() {
  form.questions.push({ text: '', type: 'rating', options: null, required: false })
}

function setType(question: SurveyQuestionForm, type: SurveyQuestionType) {
  question.type = type
  question.options = type === 'choice' ? (question.options ?? ['', '']) : null
}

function setOptions(question: SurveyQuestionForm, value: string) {
  question.options = value.split('\n').map(option => option.trim()).filter(Boolean).slice(0, 8)
}

function share(count: number) {
  const total = results.value?.responses ?? 0
  return total ? `${(count / total) * 100}%` : '0%'
}

function npsClass(score: number | null) {
  if (score === null) return 'text-white/50 light:text-slate-500'
  if (score >= 30) return 'text-emerald-400 light:text-emerald-700'
  return score >= 0 ? 'text-amber-300 light:text-amber-700' : 'text-rose-400 light:text-rose-600'
}

async function persist(body: CourseSurveyForm, message: string) {
  saving.value = true
  try {
    survey.value = await saveSurvey(props.slug, body)
    editing.value = false
    toast.success(message)
  } catch (err) {
    toast.error('Survey Not Saved', getErrorMessage(err, 'Unable to save the survey'))
  } finally {
    saving.value = false
  }
}

function save() {
  return persist({
    trigger: form.trigger,
    active: form.active,
    questions: form.questions.map(q => ({ text: q.text.trim(), type: q.type, options: q.type === 'choice' ? q.options : null, required: q.required })),
  }, 'Survey Saved')
}

function toggleActive() {
  const current = survey.value
  if (!current) return
  return persist({
    trigger: current.trigger,
    active: !current.active,
    questions: current.questions.map(q => ({ text: q.text, type: q.type, options: q.options, required: q.required })),
  }, current.active ? 'Survey Paused' : 'Survey Resumed')
}

async function remove() {
  saving.value = true
  try {
    await deleteSurvey(props.slug)
    survey.value = null
    deleting.value = false
    tab.value = 'setup'
    toast.info('Survey Deleted')
  } catch (err) {
    toast.error('Survey Not Deleted', getErrorMessage(err, 'Unable to delete the survey'))
  } finally {
    saving.value = false
  }
}
</script>
