export interface LiveSessionForm {
  title: string
  description: string | null
  startsAt: string
  durationMinutes: number
  meetingUrl: string
  recordingLessonId: number | null
}

/** Staff view, with the meeting link and how many joined. */
export interface ManagedLiveSession {
  id: number
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  durationMinutes: number
  meetingUrl: string
  recordingLessonId: number | null
  cancelled: boolean
  attendees: number
}

/** Learner view. The meeting link only comes from joining, which records attendance. */
export interface LearnerLiveSession {
  id: number
  courseSlug: string
  courseTitle: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  cancelled: boolean
  // Open from shortly before the start until the end
  joinable: boolean
  attended: boolean
  recordingLessonId: number | null
}
