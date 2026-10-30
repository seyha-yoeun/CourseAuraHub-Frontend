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
  // The running sale. price already includes it, except for admins, who see the regular price
  sale?: CourseSale | null
}

export interface CourseSale {
  salePrice: number
  discountType: string
  discountValue: number
  // Null when the sale has no end date
  endsAt: string | null
}

export interface CourseDiscount {
  id: number
  courseSlug: string
  courseTitle: string
  discountType: string
  discountValue: number
  regularPrice: number
  salePrice: number
  startsAt: string
  endsAt: string | null
  active: boolean
  // Whether learners are getting this price right now
  running: boolean
  createdAt: string
}

export interface CourseDiscountCreate {
  courseSlug: string
  discountType: string
  discountValue: number
  startsAt?: string
  endsAt?: string
}

export type CourseDiscountUpdate = Partial<Omit<CourseDiscountCreate, 'courseSlug'>> & { active?: boolean }

export type CourseFormData = Omit<
  Course,
  'id' | 'slug' | 'rating' | 'totalStudents' | 'revenue' | 'completionRate' | 'createdAt' | 'updatedAt' | 'monthlyEnrollments' | 'monthlyRevenue' | 'enrolledStudentList' | 'sale'
>

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

export interface Order {
  orderNumber: string
  courseSlug: string
  courseTitle: string
  thumbnail: string
  // Price before any coupon
  listAmount: number
  discountAmount: number
  couponCode: string | null
  // What the learner pays
  amount: number
  currency: string
  status: OrderStatus
  // Where to pay; null once the order is no longer pending
  checkoutUrl: string | null
  createdAt: string
  paidAt: string | null
  refundedAt: string | null
}

export interface AdminOrder {
  order: Order
  studentId: number
  studentEmail: string
  provider: string | null
  providerReference: string | null
}

export interface AdminOrderPage {
  items: AdminOrder[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

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
  /** Where to resume; null once the course is completed */
  nextLesson: NextLesson | null
}

export interface NextLesson {
  lessonId: number
  title: string
  type: LessonType
  durationMinutes: number
  sectionId: number
  sectionTitle: string
  /** Seconds into the video to continue from, if it was started */
  resumePositionSeconds?: number | null
}

export interface LearningStreak {
  currentDays: number
  longestDays: number
  activeToday: boolean
}

export interface DailyActivity {
  date: string
  lessonsCompleted: number
}

export interface LearnerDashboard {
  enrolledCourses: number
  inProgressCourses: number
  completedCourses: number
  certificatesEarned: number
  lessonsCompleted: number
  minutesLearned: number
  streak: LearningStreak
  /** Oldest first, ending today */
  lastSevenDays: DailyActivity[]
  continueLearning: MyCourse | null
  timeZone: string
}

export interface Achievement {
  code: string
  title: string
  description: string
  metric: 'lessons_completed' | 'certificates_earned' | 'longest_streak_days' | 'reviews_written'
  progress: number
  target: number
  earned: boolean
}

export interface Certificate {
  certificateNumber: string
  courseSlug: string
  courseTitle: string
  instructor: string
  thumbnail: string
  issuedAt: string
}

export interface CertificateVerification {
  certificateNumber: string
  learnerName: string
  courseTitle: string
  instructor: string
  issuedAt: string
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
  /** Seconds into the video to continue from, if it was started */
  resumePositionSeconds?: number | null
}

export interface LessonPosition {
  lessonId: number
  positionSeconds: number
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
  nextLessonId: number | null
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
