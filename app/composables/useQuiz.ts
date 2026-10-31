import type { AdminQuiz, Quiz, QuizFormData, QuizResult } from '~/types'

export function useQuiz() {
  async function fetchQuiz(lessonId: number) {
    return await $fetch<Quiz>(`/api/me/lessons/${lessonId}/quiz`)
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

  return { fetchQuiz, submitQuiz, fetchAdminQuiz, saveQuiz }
}
