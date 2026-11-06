// instant sends right away, digest batches them into one daily email
export type EmailMode = 'instant' | 'digest' | 'off'

export interface EmailPreference {
  // A notification type, such as certificate_issued
  type: string
  mode: EmailMode
  defaultMode: EmailMode
}
