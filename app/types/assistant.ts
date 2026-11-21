export interface AssistantMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface AssistantConversation {
  id: number
  lessonId: number
  createdAt: string
  messages: AssistantMessage[]
}

/** Today's allowance; it resets at midnight UTC. */
export interface AssistantUsage {
  tokensUsed: number
  tokensLeft: number
}

export interface LessonSummary {
  lessonId: number
  summary: string
}

export interface AssistantSource {
  lessonId: number
  characters: number
  updatedAt: string
}

/** A drafted question in the quiz editor's format. Nothing is saved until the quiz is. */
export interface DraftQuizQuestion {
  prompt: string
  explanation: string | null
  options: { text: string, correct: boolean }[]
}
