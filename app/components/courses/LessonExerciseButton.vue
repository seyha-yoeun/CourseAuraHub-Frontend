<template>
  <button type="button" :class="iconButtonClass" :aria-label="`Coding exercise for ${lesson.title}`" title="Coding exercise" @click="open">
    <Code2 :size="13" />
  </button>

  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6" @click.self="isOpen = false">
        <form
          ref="dialogRef"
          class="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-violet-500/25 bg-[#0f1019] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] focus:outline-none light:border-violet-500/30 light:bg-white light:shadow-xl"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`${uid}-title`"
          tabindex="-1"
          @submit.prevent="save"
        >
          <div class="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4 sm:px-6 light:border-slate-200">
            <div>
              <h3 :id="`${uid}-title`" class="text-lg font-bold text-slate-50 light:text-slate-900">Coding Exercise · {{ lesson.title }}</h3>
              <p class="mt-1 text-xs text-white/50 light:text-slate-500">Learners see the examples. The hidden tests decide whether their code passes, which completes the lesson.</p>
            </div>
            <button type="button" class="cursor-pointer text-white/50 hover:text-white light:text-slate-500" aria-label="Close" @click="isOpen = false"><X :size="18" /></button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div v-if="loading" class="h-48 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
            <div v-else class="flex flex-col gap-4">
              <div class="grid gap-3 sm:grid-cols-3">
                <div>
                  <span :class="labelClass">Language</span>
                  <AppDropdown :model-value="form.language" :options="languageOptions" aria-label="Programming language" @update:model-value="value => form.language = String(value)" />
                </div>
                <div>
                  <label :class="labelClass" :for="`${uid}-time`">Time limit (seconds)</label>
                  <input :id="`${uid}-time`" v-model.number="form.timeLimitSeconds" type="number" min="0.5" max="15" step="0.5" :class="inputClass">
                </div>
                <div>
                  <label :class="labelClass" :for="`${uid}-memory`">Memory (MB)</label>
                  <input :id="`${uid}-memory`" v-model.number="form.memoryLimitMb" type="number" min="16" max="512" :class="inputClass">
                </div>
              </div>

              <div>
                <label :class="labelClass" :for="`${uid}-instructions`">Instructions</label>
                <textarea :id="`${uid}-instructions`" v-model="form.instructions" rows="4" maxlength="10000" placeholder="What the program should do, and the input and output format" :class="inputClass" />
              </div>
              <div>
                <label :class="labelClass" :for="`${uid}-starter`">Starter code</label>
                <textarea :id="`${uid}-starter`" v-model="form.starterCode" rows="6" maxlength="20000" spellcheck="false" class="font-mono" :class="inputClass" />
              </div>

              <div v-for="group in groups" :key="group.key" class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ group.title }} <span class="text-xs font-normal text-white/45 light:text-slate-500">{{ group.hint }}</span></p>
                  <button type="button" :class="neutralAction" :disabled="form[group.key].length >= group.max" @click="form[group.key].push({ input: '', expectedOutput: '' })">
                    <span class="inline-flex items-center gap-1"><Plus :size="12" /> Add</span>
                  </button>
                </div>
                <div v-for="(item, index) in form[group.key]" :key="index" class="grid gap-2 rounded-xl border border-white/8 bg-white/3 p-2.5 sm:grid-cols-[1fr_1fr_auto] light:border-slate-200 light:bg-slate-50">
                  <textarea v-model="item.input" rows="2" maxlength="10000" spellcheck="false" placeholder="Input (stdin)" :aria-label="`${group.title} ${index + 1} input`" class="font-mono" :class="inputClass" />
                  <textarea v-model="item.expectedOutput" rows="2" maxlength="10000" spellcheck="false" placeholder="Expected output" :aria-label="`${group.title} ${index + 1} expected output`" class="font-mono" :class="inputClass" />
                  <button type="button" :class="dangerAction" class="self-start" :aria-label="`Remove ${group.title} ${index + 1}`" @click="form[group.key].splice(index, 1)"><Trash2 :size="13" /></button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2.5 border-t border-white/8 px-5 py-3.5 sm:px-6 light:border-slate-200">
            <button type="button" :class="neutralAction" @click="isOpen = false">Cancel</button>
            <button type="submit" :class="primaryAction" :disabled="saving || loading || !form.tests.length">Save Exercise</button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Code2, Plus, Trash2, X } from 'lucide-vue-next'
import type { Lesson } from '~/types'
import type { CodeCase } from '~/types/coding'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { DEFAULT_CODE_LANGUAGES, useCoding } from '~/composables/useCoding'
import { useModalA11y } from '~/composables/useModalA11y'
import { getErrorMessage } from '~/utils/apiError'
import { dangerAction, inputClass, labelClass, neutralAction, primaryAction } from '~/utils/ui'

/** A curriculum row button for code lessons: write the exercise, its visible examples and hidden tests. */
const props = defineProps<{ lesson: Lesson }>()

const toast = useAppToast()
const uid = `exercise-${useId()}`
const { fetchForStaff, saveExercise } = useCoding()

const iconButtonClass = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900'
const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0',
}

const isOpen = ref(false)
const dialogRef = ref<HTMLElement | null>(null)
useModalA11y({ isOpen, dialogRef, onClose: () => (isOpen.value = false) })

const loading = ref(false)
const saving = ref(false)
const languages = ref<string[]>(DEFAULT_CODE_LANGUAGES)
const languageOptions = computed(() => languages.value.map(language => ({ value: language, label: language })))
const form = reactive({
  language: 'python',
  instructions: '',
  starterCode: '',
  timeLimitSeconds: 2 as number | '',
  memoryLimitMb: 128 as number | '',
  examples: [] as CodeCase[],
  tests: [] as CodeCase[],
})

const groups = [
  { key: 'examples', title: 'Examples', hint: 'shown to learners, up to 10', max: 10 },
  { key: 'tests', title: 'Hidden tests', hint: '1 to 20, never shown', max: 20 },
] as const

async function open() {
  isOpen.value = true
  loading.value = true
  try {
    const exercise = await fetchForStaff(props.lesson.id)
    if (exercise?.languages?.length) languages.value = exercise.languages
    Object.assign(form, {
      language: exercise?.language ?? languages.value[0] ?? 'python',
      instructions: exercise?.instructions ?? '',
      starterCode: exercise?.starterCode ?? '',
      timeLimitSeconds: exercise?.timeLimitSeconds ?? 2,
      memoryLimitMb: exercise?.memoryLimitMb ?? 128,
      examples: exercise?.examples.map(item => ({ ...item })) ?? [{ input: '', expectedOutput: '' }],
      tests: exercise?.tests.map(item => ({ ...item })) ?? [{ input: '', expectedOutput: '' }],
    })
  } catch (err) {
    toast.error('Exercise Not Loaded', getErrorMessage(err, 'Unable to load the exercise'))
    isOpen.value = false
  } finally {
    loading.value = false
  }
}

function clean(cases: CodeCase[]) {
  return cases.filter(item => (item.input ?? '').trim() || item.expectedOutput.trim())
    .map(item => ({ input: item.input || null, expectedOutput: item.expectedOutput }))
}

async function save() {
  saving.value = true
  try {
    await saveExercise(props.lesson.id, {
      language: form.language,
      instructions: form.instructions.trim() || null,
      starterCode: form.starterCode || null,
      examples: clean(form.examples),
      tests: clean(form.tests),
      timeLimitSeconds: form.timeLimitSeconds === '' ? null : Number(form.timeLimitSeconds),
      memoryLimitMb: form.memoryLimitMb === '' ? null : Number(form.memoryLimitMb),
    })
    toast.success('Exercise Saved', props.lesson.title)
    isOpen.value = false
  } catch (err) {
    toast.error('Exercise Not Saved', getErrorMessage(err, 'Unable to save the exercise'))
  } finally {
    saving.value = false
  }
}
</script>
