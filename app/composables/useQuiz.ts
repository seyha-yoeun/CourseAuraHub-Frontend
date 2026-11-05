import type { AdminQuiz, Quiz, QuizAttemptGrant, QuizFormData, QuizResult } from '~/types'

export function useQuiz() {
  async function fetchQuiz(lessonId: number) {
    return await $fetch<Quiz>(`/api/me/lessons/${lessonId}/quiz`)
  }

  /** Draws a timed, pooled or shuffled quiz's questions and starts its clock, or returns the attempt in progress. */
  async function startQuiz(lessonId: number) {
    return await $fetch<Quiz>(`/api/me/lessons/${lessonId}/quiz/start`, { method: 'POST' })
  }

  async function submitQuiz(lessonId: number, answers: Record<number, number>) {
    return await $fetch<QuizResult>(`/api/me/lessons/${lessonId}/quiz/attempts`, { method: 'POST', body: { answers } })
  }

  async function fetchAdminQuiz(lessonId: number) {
    return await $fetch<AdminQuiz>(`/api/admin/lessons/${lessonId}/quiz`)
  }

  async function saveQuiz(lessonId: number, data: QuizFormData) {
    return await $fetch<AdminQuiz>(`/api/admin/lessons/${lessonId}/quiz`, { method: 'PUT', body: data })
  }

  /** Extra attempts for one enrolled learner beyond the quiz's limit. Course staff only. */
  async function grantAttempts(lessonId: number, studentId: number, extraAttempts = 1) {
    return await $fetch<QuizAttemptGrant>(`/api/admin/lessons/${lessonId}/quiz/attempt-grants`, {
      method: 'POST',
      body: { studentId, extraAttempts }
    })
  }

  return { fetchQuiz, startQuiz, submitQuiz, fetchAdminQuiz, saveQuiz, grantAttempts }
}
