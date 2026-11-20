export type SurveyTrigger = 'percent_50' | 'completion'
export type SurveyQuestionType = 'rating' | 'choice' | 'text'

export interface SurveyQuestion {
  id: string
  text: string
  type: SurveyQuestionType
  options: string[] | null
  required: boolean
}

export interface SurveyQuestionForm {
  text: string
  type: SurveyQuestionType
  options: string[] | null
  required: boolean
}

/** The built-in 0-10 recommendation question is always asked first. */
export interface CourseSurvey {
  courseSlug: string
  trigger: SurveyTrigger
  active: boolean
  recommendQuestion: string
  questions: SurveyQuestion[]
}

export interface CourseSurveyForm {
  trigger: SurveyTrigger
  active: boolean
  questions: SurveyQuestionForm[]
}

export interface LearnerSurvey {
  survey: CourseSurvey
  // Whether the learner has reached the point in the course where they're asked
  eligible: boolean
  answered: boolean
}

/** Answers by question id: 1-5 for ratings, the option text for choices, free text otherwise. */
export interface SurveyAnswer {
  npsScore: number
  answers: Record<string, number | string>
}

export interface SurveyNps {
  // Promoters minus detractors, in percentage points; null without responses
  score: number | null
  promoters: number
  passives: number
  detractors: number
}

export interface SurveyQuestionResult {
  id: string
  text: string
  type: SurveyQuestionType
  answered: number
  average: number | null
  // Counts per rating or per option
  distribution: Record<string, number> | null
  // The latest text answers, without who wrote them
  comments: string[] | null
}

export interface SurveyResults {
  courseSlug: string
  responses: number
  nps: SurveyNps
  questions: SurveyQuestionResult[]
}
