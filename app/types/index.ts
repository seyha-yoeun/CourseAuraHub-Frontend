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
  courseId: number
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
