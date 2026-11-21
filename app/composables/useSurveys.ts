import type { CourseSurvey, CourseSurveyForm, LearnerSurvey, SurveyAnswer, SurveyResults } from '~/types/survey'

/** Course feedback surveys: staff set one up per course, learners answer it once at its point in the course. */
export function useSurveys() {
  function managePath(slug: string) {
    return `/api/instructor/courses/${encodeURIComponent(slug)}/survey`
  }

  /** The course's survey, or null when it has none. */
  async function fetchSurvey(slug: string) {
    return (await $fetch<CourseSurvey | null>(managePath(slug))) ?? null
  }

  async function saveSurvey(slug: string, body: CourseSurveyForm) {
    return await $fetch<CourseSurvey>(managePath(slug), { method: 'PUT', body })
  }

  /** Deletes the survey and its responses. */
  async function deleteSurvey(slug: string) {
    return await $fetch<null>(managePath(slug), { method: 'DELETE' })
  }

  async function fetchResults(slug: string) {
    return await $fetch<SurveyResults>(`${managePath(slug)}/results`)
  }

  async function fetchForLearner(slug: string) {
    return await $fetch<LearnerSurvey>(`/api/me/courses/${encodeURIComponent(slug)}/survey`)
  }

  async function answerSurvey(slug: string, body: SurveyAnswer) {
    return await $fetch<null>(`/api/me/courses/${encodeURIComponent(slug)}/survey`, { method: 'POST', body })
  }

  return { fetchSurvey, saveSurvey, deleteSurvey, fetchResults, fetchForLearner, answerSurvey }
}
