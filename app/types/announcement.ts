export interface Announcement {
  id: number
  courseSlug: string
  title: string
  body: string
  authorName: string
  createdAt: string
}

export interface AnnouncementPage {
  content: Announcement[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AnnouncementForm {
  title: string
  body: string
}
