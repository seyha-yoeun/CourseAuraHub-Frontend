import type {
  AssistantConversation,
  AssistantSource,
  AssistantUsage,
  DraftQuizQuestion,
  LessonSummary,
} from '~/types/assistant'
import { getErrorMessage } from '~/utils/apiError'

export interface AskHandlers {
  onConversation?: (conversationId: number) => void
  onDelta: (text: string) => void
}

export interface AskResult {
  conversationId: number | null
  // The assistant declined to answer (for example, the question was off-topic or unsafe)
  refused: boolean
}

/** The AI study assistant: answers from a lesson's study text, summarizes it, and drafts quiz questions for staff. */
export function useAssistant() {
  async function fetchConversations(lessonId: number) {
    return await $fetch<AssistantConversation[]>(`/api/me/lessons/${lessonId}/assistant/conversations`)
  }

  async function fetchUsage() {
    return await $fetch<AssistantUsage>('/api/me/assistant/usage')
  }

  async function fetchSummary(lessonId: number) {
    return await $fetch<LessonSummary>(`/api/me/lessons/${lessonId}/summary`)
  }

  async function saveSource(lessonId: number, body: string) {
    return await $fetch<AssistantSource>(`/api/instructor/lessons/${lessonId}/assistant-source`, { method: 'PUT', body: { body } })
  }

  async function draftQuiz(lessonId: number, count = 5) {
    return await $fetch<DraftQuizQuestion[]>(`/api/instructor/lessons/${lessonId}/quiz/draft`, { method: 'POST', body: { count } })
  }

  /**
   * Asks a question and streams the answer. The server sends `conversation`, then `delta` pieces, then `done`
   * or `error`; $fetch can't read a POST stream, so this parses it from fetch.
   */
  async function ask(lessonId: number, message: string, conversationId: number | null, handlers: AskHandlers, signal?: AbortSignal): Promise<AskResult> {
    const response = await fetch(`/api/me/lessons/${lessonId}/assistant/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify({ conversationId, message }),
      signal,
    })
    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => null)
      throw new Error(getErrorMessage({ data }, 'The study assistant couldn\'t answer. Please try again.'))
    }

    const result: AskResult = { conversationId, refused: false }
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ''

    const handle = (block: string) => {
      let name = 'message'
      const data: string[] = []
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) name = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''))
      }
      if (!data.length) return
      const payload = JSON.parse(data.join('\n')) as Record<string, unknown>
      if (name === 'conversation') {
        result.conversationId = Number(payload.conversationId)
        handlers.onConversation?.(result.conversationId)
      } else if (name === 'delta') {
        handlers.onDelta(String(payload.text ?? ''))
      } else if (name === 'done') {
        result.refused = Boolean(payload.refused)
      } else if (name === 'error') {
        throw new Error(String(payload.message ?? 'The study assistant couldn\'t answer. Please try again.'))
      }
    }

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += value.replace(/\r\n/g, '\n')
      let boundary = buffer.indexOf('\n\n')
      while (boundary !== -1) {
        handle(buffer.slice(0, boundary))
        buffer = buffer.slice(boundary + 2)
        boundary = buffer.indexOf('\n\n')
      }
    }
    if (buffer.trim()) handle(buffer)
    return result
  }

  return { fetchConversations, fetchUsage, fetchSummary, saveSource, draftQuiz, ask }
}
