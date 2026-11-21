<template>
  <section class="flex flex-col gap-4 rounded-[20px] border border-white/10 bg-white/5 p-4 sm:p-5 light:border-slate-200 light:bg-white">
    <div v-if="pending" class="h-64 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="!exercise" class="py-10 text-center text-[13px] text-white/50 light:text-slate-500">{{ t('This coding exercise isn\'t ready yet.') }}</p>

    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="flex items-center gap-2 text-base font-bold text-slate-100 light:text-slate-900">
          <Code2 :size="18" class="text-violet-400" /> {{ t('Coding exercise') }}
        </h2>
        <div class="flex flex-wrap items-center gap-2 text-[11px]">
          <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-white/70 light:border-slate-200 light:bg-slate-100 light:text-slate-600">{{ exercise.language }}</span>
          <span v-if="exercise.passed" class="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/12 px-2.5 py-0.5 font-semibold text-emerald-400 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700">
            <CheckCircle2 :size="12" /> {{ t('Passed') }}
          </span>
        </div>
      </div>

      <p v-if="exercise.instructions" class="text-[13px] leading-relaxed whitespace-pre-line text-white/80 light:text-slate-700">{{ exercise.instructions }}</p>

      <div v-if="exercise.examples.length" class="grid gap-2 sm:grid-cols-2">
        <div v-for="(example, index) in exercise.examples" :key="index" class="rounded-xl border border-white/8 bg-black/20 p-3 font-mono text-xs light:border-slate-200 light:bg-slate-50">
          <p class="mb-1 font-sans text-[11px] font-semibold text-white/45 light:text-slate-500">{{ t('Example {number}', { number: index + 1 }) }}</p>
          <p class="text-white/45 light:text-slate-500">{{ t('Input') }}</p>
          <pre class="m-0 whitespace-pre-wrap text-slate-100 light:text-slate-900">{{ example.input || '—' }}</pre>
          <p class="mt-1.5 text-white/45 light:text-slate-500">{{ t('Expected output') }}</p>
          <pre class="m-0 whitespace-pre-wrap text-slate-100 light:text-slate-900">{{ example.expectedOutput }}</pre>
        </div>
      </div>
      <p class="text-[11px] text-white/45 light:text-slate-500">
        {{ t('Your program reads the input and prints the output. Plus {count} hidden tests. Limits: {seconds}s, {memory} MB.', { count: exercise.hiddenTests, seconds: exercise.timeLimitSeconds, memory: exercise.memoryLimitMb }) }}
      </p>

      <div class="overflow-hidden rounded-xl border border-white/10 light:border-slate-300">
        <div class="flex items-center justify-between gap-2 border-b border-white/8 bg-white/4 px-3 py-1.5 light:border-slate-200 light:bg-slate-50">
          <span class="text-[11px] font-semibold text-white/50 light:text-slate-500">{{ t('Your code') }}</span>
          <button v-if="exercise.starterCode" type="button" class="cursor-pointer text-[11px] font-semibold text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-900" @click="code = exercise.starterCode ?? ''">{{ t('Reset to starter code') }}</button>
        </div>
        <textarea
          v-model="code"
          rows="14"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          :aria-label="t('Your code')"
          class="block w-full resize-y bg-zinc-950 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-slate-100 outline-none light:bg-white light:text-slate-900"
          @keydown.tab.prevent="indent"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button v-if="enrolled" type="button" :class="primaryButton" :disabled="running || !code.trim() || !exercise.runsEnabled" @click="run">
          <Loader2 v-if="running" :size="15" class="animate-spin" />
          <Play v-else :size="15" />
          {{ t('Run tests') }}
        </button>
        <p v-if="!exercise.runsEnabled" class="text-xs text-amber-400 light:text-amber-700">{{ t('Running code isn\'t available right now.') }}</p>
        <p v-else-if="!enrolled" class="text-xs text-white/50 light:text-slate-500">{{ t('Enroll to run your code.') }}</p>
      </div>

      <!-- Result -->
      <div v-if="result" class="flex flex-col gap-2 rounded-xl border p-3.5" :class="result.passed ? 'border-emerald-400/30 bg-emerald-500/8 light:border-emerald-200 light:bg-emerald-50' : 'border-rose-400/30 bg-rose-500/8 light:border-rose-200 light:bg-rose-50'">
        <p class="flex flex-wrap items-center gap-2 text-[13px] font-bold" :class="result.passed ? 'text-emerald-300 light:text-emerald-700' : 'text-rose-300 light:text-rose-700'">
          <CheckCircle2 v-if="result.passed" :size="16" /><XCircle v-else :size="16" />
          {{ t(VERDICT_LABELS[result.verdict] ?? result.verdict) }}
          <span class="font-normal text-white/60 light:text-slate-600">{{ t('{passed} of {total} tests passed', { passed: result.passedTests, total: result.totalTests }) }}</span>
        </p>
        <pre v-if="result.message" class="m-0 max-h-48 overflow-auto rounded-lg bg-black/30 p-2.5 font-mono text-xs whitespace-pre-wrap text-white/80 light:bg-white light:text-slate-700">{{ result.message }}</pre>
        <div v-for="(example, index) in result.examples" :key="index" class="rounded-lg border border-white/8 p-2.5 font-mono text-xs light:border-slate-200">
          <p class="mb-1 flex items-center gap-1.5 font-sans text-[11px] font-semibold" :class="example.passed ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-600'">
            <CheckCircle2 v-if="example.passed" :size="12" /><XCircle v-else :size="12" /> {{ t('Example {number}', { number: index + 1 }) }}
          </p>
          <template v-if="!example.passed">
            <p class="text-white/45 light:text-slate-500">{{ t('Expected output') }}</p>
            <pre class="m-0 whitespace-pre-wrap text-slate-100 light:text-slate-900">{{ example.expectedOutput }}</pre>
            <p class="mt-1 text-white/45 light:text-slate-500">{{ t('Your output') }}</p>
            <pre class="m-0 whitespace-pre-wrap text-slate-100 light:text-slate-900">{{ example.actualOutput ?? '—' }}</pre>
          </template>
        </div>
      </div>
      <p v-else-if="exercise.lastSubmission" class="text-xs text-white/50 light:text-slate-500">
        {{ t('Last run: {result}, {passed} of {total} tests passed.', { result: t(VERDICT_LABELS[exercise.lastSubmission.verdict] ?? exercise.lastSubmission.verdict), passed: exercise.lastSubmission.passedTests, total: exercise.lastSubmission.totalTests }) }}
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { CheckCircle2, Code2, Loader2, Play, XCircle } from 'lucide-vue-next'
import type { CodeRunResult, LearnerCodeExercise } from '~/types/coding'
import { useAppToast } from '~/composables/useAppToast'
import { VERDICT_LABELS, useCoding } from '~/composables/useCoding'
import { getErrorMessage } from '~/utils/apiError'
import { primaryButton } from '~/utils/ui'

/** A code lesson's exercise. Passing every test completes the lesson, which is reported with `completed`. */
const props = defineProps<{ lessonId: number, enrolled: boolean }>()
const emit = defineEmits<{ completed: [] }>()

const { t } = useT()
const toast = useAppToast()
const { fetchForLearner, runCode } = useCoding()

const exercise = ref<LearnerCodeExercise | null>(null)
const pending = ref(true)
const code = ref('')
const running = ref(false)
const result = ref<CodeRunResult | null>(null)

onMounted(async () => {
  exercise.value = await fetchForLearner(props.lessonId).catch(() => null)
  code.value = exercise.value?.lastSubmission?.code ?? exercise.value?.starterCode ?? ''
  pending.value = false
})

function indent(event: KeyboardEvent) {
  const area = event.target as HTMLTextAreaElement
  const { selectionStart: start, selectionEnd: end } = area
  code.value = `${code.value.slice(0, start)}    ${code.value.slice(end)}`
  nextTick(() => {
    area.selectionStart = area.selectionEnd = start + 4
  })
}

async function run() {
  running.value = true
  try {
    result.value = await runCode(props.lessonId, code.value)
    if (result.value.passed && exercise.value) exercise.value.passed = true
    if (result.value.lessonCompleted) emit('completed')
  } catch (err) {
    toast.error(t('Code not run'), getErrorMessage(err, t('Unable to run your code')))
  } finally {
    running.value = false
  }
}
</script>
