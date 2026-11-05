import type { Course } from '~/types'

/** The signed-in instructor's own profile settings. */
export interface InstructorProfile {
  handle: string
  headline: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  youtubeUrl: string | null
  // Frontend path of the public page, such as /instructors/jane-doe
  publicPath: string
}

/** Null keeps a value; an empty string clears it. */
export interface InstructorProfileForm {
  handle?: string
  headline?: string
  linkedinUrl?: string
  githubUrl?: string
  youtubeUrl?: string
}

export interface PublicInstructor {
  handle: string
  name: string
  headline: string | null
  bio: string | null
  avatarUrl: string | null
  links: {
    website: string | null
    twitter: string | null
    linkedin: string | null
    github: string | null
    youtube: string | null
  }
  stats: { courses: number, students: number, averageRating: number, reviews: number }
  courses: Course[]
}

export interface InstructorCard {
  handle: string
  name: string
  headline: string | null
  avatarUrl: string | null
  courses: number
  students: number
}
