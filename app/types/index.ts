declare module '#app' {
  interface PageMeta {
    requiresAdmin?: boolean
  }
}

export interface Course {
  id: number
  slug: string
  title: string
  description: string
  instructor: string
  price: number
  originalPrice: number
  status: 'published' | 'draft' | 'archived'
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  thumbnail: string
  rating: number
  totalStudents: number
  totalLessons: number
  totalHours: number
  revenue: number
  completionRate: number
  tags: string[]
  createdAt: string
  updatedAt: string
  monthlyEnrollments: number[]
  monthlyRevenue: number[]
  enrolledStudentList?: Student[]
  // Whether the caller is enrolled; only set on the course detail response
  enrolled?: boolean | null
}

export type CourseFormData = Omit<
  Course,
  'id' | 'slug' | 'rating' | 'totalStudents' | 'revenue' | 'completionRate' | 'createdAt' | 'updatedAt' | 'monthlyEnrollments' | 'monthlyRevenue' | 'enrolledStudentList'
>

export interface Student {
  id: number
  name: string
  email: string
  avatar: string
  enrolledCourses: number[]
  totalSpent: number
  joinedAt: string
  lastActive: string
  status: 'active' | 'inactive'
  completedCourses: number[]
  country: string
}

export interface Enrollment {
  id: number
  studentId: number
  studentName?: string
  courseId: number
  courseTitle?: string
  courseSlug?: string
  enrolledAt: string
  amount: number
}

export interface RecentEnrollmentItem {
  id: number
  studentName: string
  studentAvatar: string
  studentCountry: string
  courseTitle: string
  courseSlug: string
  amount: number
  enrolledAt: string
}

export interface TopCourseItem {
  slug: string
  title: string
  revenue: number
  totalStudents: number
  rating: number
  category?: string
  price?: number
  status?: string
}

export interface DashboardStats {
  kpis: {
    totalRevenue: number
    totalStudents: number
    totalCourses: number
    publishedCourses: number
    avgRating: number
    revenueGrowth: number
    studentGrowth: number
  }
  charts: {
    months: string[]
    monthlyRevenue: number[]
    monthlyEnrollments: number[]
    revenueByCategory: Record<string, number>
  }
  topCourses: TopCourseItem[]
  recentEnrollments: RecentEnrollmentItem[]
}

export interface PlatformSettings {
  platformName: string
  platformTagline: string
  currency: string
  defaultLanguage: string
  notifications: {
    newEnrollment: boolean
    courseCompletion: boolean
    weeklyReport: boolean
    marketingEmails: boolean
  }
  profile: {
    name: string
    email: string
    role: string
    avatar: string
    bio: string
    website: string
    twitter: string
  }
}

// Learner self-service (/api/v1/me/**) and curriculum

export interface CourseProgress {
  completedLessons: number
  totalLessons: number
  progressPercent: number
  completed: boolean
}

export interface MyCourse {
  courseId: number
  slug: string
  title: string
  thumbnail: string
  instructor: string
  level: string
  enrolledAt: string
  progress: CourseProgress
  lastActivityAt: string | null
}

export interface WishlistItem {
  courseId: number
  slug: string
  title: string
  thumbnail: string
  instructor: string
  level: string
  price: number
  originalPrice: number
  rating: number
  addedAt: string
}

export interface LearnerProfile {
  userId: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string | null
  bio: string | null
  website: string | null
  twitter: string | null
  provider: string
  hasPassword: boolean
}

export type LearnerProfileUpdate = Partial<Pick<LearnerProfile, 'firstName' | 'lastName' | 'imageUrl' | 'bio' | 'website' | 'twitter'>>

export type LessonType = 'video' | 'article' | 'quiz'

export interface Lesson {
  id: number
  title: string
  type: LessonType
  durationMinutes: number
  preview: boolean
  position: number
  locked: boolean
  contentUrl: string | null
  completed: boolean
}

export interface CourseSection {
  id: number
  title: string
  position: number
  totalDurationMinutes: number
  lessons: Lesson[]
}

export interface Curriculum {
  courseId: number
  courseSlug: string
  enrolled: boolean
  totalLessons: number
  totalDurationMinutes: number
  progress: CourseProgress | null
  sections: CourseSection[]
}

export interface LessonFormData {
  title: string
  type: LessonType
  durationMinutes: number
  contentUrl: string
  preview: boolean
}

export interface LessonProgressResult {
  lessonId: number
  courseSlug: string
  lessonCompleted: boolean
  courseProgress: CourseProgress
}

export interface Review {
  id: number
  rating: number
  comment: string | null
  reviewerName: string
  reviewerAvatar: string | null
  createdAt: string
  updatedAt: string
}

export interface ReviewPage {
  items: Review[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  averageRating: number | null
}
