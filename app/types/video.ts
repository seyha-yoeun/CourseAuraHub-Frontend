export type VideoStatus = 'processing' | 'ready' | 'failed'

/** A WebVTT caption track; url is a short-lived signed link. */
export interface LessonCaption {
  language: string
  label: string
  url: string
}

/** Streaming details for one lesson, only for viewers who can watch it. */
export interface LessonMedia {
  lessonId: number
  // null when the lesson has no uploaded video
  status: VideoStatus | null
  // API path of the HLS playlist once it's ready; the lesson's own file plays until then
  streamUrl: string | null
  durationSeconds: number | null
  captions: LessonCaption[]
}

export interface LessonTranscript {
  lessonId: number
  language: string
  text: string
}
