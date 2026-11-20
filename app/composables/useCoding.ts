import type { CodeExercise, CodeExerciseForm, CodeRunResult, LearnerCodeExercise } from '~/types/coding'

/** Coding exercises: staff write them for code lessons; learners' code runs in a sandbox against their tests. */
export function useCoding() {
  /** The lesson's exercise with hidden tests, or null when it has none yet. */
  async function fetchForStaff(lessonId: number) {
    return (await $fetch<CodeExercise | null>(`/api/instructor/lessons/${lessonId}/exercise`)) ?? null
  }

  async function saveExercise(lessonId: number, body: CodeExerciseForm) {
    return await $fetch<CodeExercise>(`/api/instructor/lessons/${lessonId}/exercise`, { method: 'PUT', body })
  }

  async function fetchForLearner(lessonId: number) {
    return await $fetch<LearnerCodeExercise>(`/api/me/lessons/${lessonId}/exercise`)
  }

  /** Passing every test completes the lesson. */
  async function runCode(lessonId: number, code: string) {
    return await $fetch<CodeRunResult>(`/api/me/lessons/${lessonId}/exercise/runs`, { method: 'POST', body: { code } })
  }

  return { fetchForStaff, saveExercise, fetchForLearner, runCode }
}

// The server's defaults; a saved exercise reports the languages actually configured
export const DEFAULT_CODE_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go']

export const VERDICT_LABELS: Record<string, string> = {
  accepted: 'All tests passed',
  wrong_answer: 'Wrong answer',
  compile_error: 'Compile error',
  runtime_error: 'Runtime error',
  time_limit: 'Time limit exceeded',
  error: 'Couldn\'t run the code',
}
