<template>
  <section v-if="quizLessons.length && students.length" class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
    <h2 class="text-base font-bold text-slate-100 light:text-slate-900">Extra quiz attempts</h2>
    <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">Give a learner one more try on a quiz with an attempt limit.</p>

    <div class="mt-3 max-w-sm">
      <AppDropdown v-model="lessonId" :options="lessonOptions" aria-label="Quiz" />
    </div>

    <ul class="m-0 mt-3 flex list-none flex-col gap-2 p-0">
      <li v-for="student in students" :key="student.id" class="flex items-center gap-2.5">
        <img :src="student.avatar" :alt="student.name" class="size-7 rounded-full bg-white/5">
        <span class="min-w-0 flex-1 truncate text-[13px] text-slate-100 light:text-slate-900">{{ student.name }}</span>
        <span v-if="granted[student.id] !== undefined" class="text-[11px] text-white/45 light:text-slate-500">
          {{ granted[student.id] === null ? 'Unlimited' : `${granted[student.id]} left` }}
        </span>
        <button
          type="button"
          class="cursor-pointer rounded-lg border border-violet-500/35 bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50 light:border-violet-300 light:bg-violet-50 light:text-violet-700"
          :disabled="!lessonId || busyId === student.id"
          @click="grant(student)"
        >
          +1 attempt
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { InstructorStudent, Lesson } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { flattenLessons, useCurriculum } from '~/composables/useCurriculum'
import { useQuiz } from '~/composables/useQuiz'
import { getErrorMessage } from '~/utils/apiError'

/** Lets course staff grant a learner another attempt on one of the course's quizzes. */
const props = defineProps<{ slug: string, students: InstructorStudent[] }>()

const toast = useAppToast()
const { fetchCurriculum } = useCurriculum()
const { grantAttempts } = useQuiz()

const quizLessons = ref<Lesson[]>([])
const lessonId = ref<number | string>('')
const busyId = ref<number | null>(null)
// Attempts left per student after a grant, for the selected quiz
const granted = ref<Record<number, number | null>>({})

const lessonOptions = computed(() => [
  { value: '', label: 'Choose a quiz' },
  ...quizLessons.value.map(lesson => ({ value: lesson.id, label: lesson.title }))
])

watch(lessonId, () => {
  granted.value = {}
})

async function grant(student: InstructorStudent) {
  if (!lessonId.value) return
  busyId.value = student.id
  try {
    const result = await grantAttempts(Number(lessonId.value), student.id)
    granted.value = { ...granted.value, [student.id]: result.attemptsRemaining }
    toast.success('Attempt granted', student.name)
  } catch (err) {
    toast.error('Not granted', getErrorMessage(err, 'Unable to grant an extra attempt'))
  } finally {
    busyId.value = null
  }
}

watch(() => props.slug, async (slug) => {
  try {
    quizLessons.value = flattenLessons(await fetchCurriculum(slug)).filter(lesson => lesson.type === 'quiz')
  } catch {
    quizLessons.value = []
  }
}, { immediate: true })
</script>
