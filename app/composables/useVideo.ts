import type { LessonCaption, LessonMedia, LessonTranscript } from '~/types/video'

/** HLS streams, captions and transcripts for video lessons. */
export function useVideo() {
  async function fetchMedia(lessonId: number) {
    return await $fetch<LessonMedia>(`/api/me/lessons/${lessonId}/media`)
  }

  async function fetchTranscript(lessonId: number, lang = 'en') {
    return await $fetch<LessonTranscript>(`/api/me/lessons/${lessonId}/transcript`, { query: { lang } })
  }

  /** Captions are uploaded as a WebVTT file first; fileRef is its storage reference. */
  async function saveCaption(slug: string, lessonId: number, lang: string, fileRef: string, label: string) {
    return await $fetch<LessonCaption>(`/api/courses/${encodeURIComponent(slug)}/lessons/${lessonId}/captions/${encodeURIComponent(lang)}`, {
      method: 'PUT',
      body: { fileRef, label },
    })
  }

  async function deleteCaption(slug: string, lessonId: number, lang: string) {
    return await $fetch<null>(`/api/courses/${encodeURIComponent(slug)}/lessons/${lessonId}/captions/${encodeURIComponent(lang)}`, { method: 'DELETE' })
  }

  /** Same-origin paths the player can load without the storage bucket allowing cross-origin reads. */
  function playlistPath(lessonId: number) {
    return `/api/me/lessons/${lessonId}/stream.m3u8`
  }

  function captionPath(lessonId: number, lang: string) {
    return `/api/me/lessons/${lessonId}/captions/${encodeURIComponent(lang)}`
  }

  return { fetchMedia, fetchTranscript, saveCaption, deleteCaption, playlistPath, captionPath }
}
