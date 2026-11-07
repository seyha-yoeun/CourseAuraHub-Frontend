import type { EmailMode, EmailPreference } from '~/types/emailPreference'

/** Which notifications are also emailed: right away, in the daily digest, or not at all. */
export function useEmailPreferences() {
  async function fetchEmailPreferences() {
    return await $fetch<EmailPreference[]>('/api/me/notification-preferences')
  }

  async function saveEmailPreferences(preferences: { type: string, mode: EmailMode }[]) {
    return await $fetch<EmailPreference[]>('/api/me/notification-preferences', { method: 'PUT', body: { preferences } })
  }

  return { fetchEmailPreferences, saveEmailPreferences }
}

export const EMAIL_TYPE_LABELS: Record<string, string> = {
  enrolled: 'Enrollments',
  payment_failed: 'Failed payments',
  order_refunded: 'Refunds',
  refund_request: 'Refund requests',
  certificate_issued: 'Certificates',
  new_lesson: 'New lessons',
  course_updated: 'Course updates',
  new_enrollment: 'New learners in my courses',
  course_completed: 'Course completions',
  member_card: 'Member card',
  lesson_question: 'Lesson questions',
  assignment: 'Assignments',
  course_review: 'Course reviews',
  course_reminder: 'Learning reminders',
  announcement: 'Course announcements',
  weekly_report: 'Weekly report',
}
