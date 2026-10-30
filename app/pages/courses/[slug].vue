<template>
  <div v-if="pending && !course" class="flex flex-col gap-5">
    <div class="h-70 w-full animate-pulse rounded-[20px] bg-white/5 light:bg-slate-100" />
    <div class="h-87.5 w-full animate-pulse rounded-[20px] bg-white/5 light:bg-slate-100" />
  </div>

  <div v-else-if="error || !course" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center backdrop-blur-md light:border-slate-200 light:bg-white">
    <AlertCircle :size="40" class="text-rose-400" />
    <h2 class="mt-3 text-xl font-bold text-slate-50 light:text-slate-900">Course Not Found</h2>
    <p class="mt-1.5 text-[13px] text-white/50 light:text-slate-500">We couldn't locate the course matching the slug "{{ route.params.slug }}".</p>
    <NuxtLink to="/courses" class="mt-4 inline-flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/6 px-4 py-2 text-[13px] font-medium text-slate-200 no-underline transition-colors hover:bg-white/10 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200 light:hover:text-slate-900">
      <ArrowLeft :size="16" />
      <span>Back to Courses</span>
    </NuxtLink>
  </div>

  <LearnerCourseView v-else-if="!auth.isAdmin" :course="course" @refresh="refresh" />

  <div v-else class="flex flex-col gap-6">
    <!-- Back breadcrumb & actions topbar -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <NuxtLink to="/courses" class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-300 no-underline transition-colors hover:text-violet-200 light:text-violet-700 light:hover:text-violet-800">
        <ArrowLeft :size="15" />
        <span>All Courses</span>
      </NuxtLink>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/35 bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100 light:hover:text-violet-900"
          @click="isEditModalOpen = true"
        >
          <Edit3 :size="15" />
          <span>Edit Course</span>
        </button>

        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-rose-200 light:bg-rose-50 light:text-rose-600 light:hover:bg-rose-100 light:hover:text-rose-700"
          @click="isDeleteModalOpen = true"
        >
          <Trash2 :size="15" />
          <span>Delete</span>
        </button>
      </div>
    </div>

    <!-- Hero Card -->
    <div class="grid overflow-hidden rounded-[20px] border border-white/8 bg-zinc-900/70 backdrop-blur-md md:grid-cols-[360px_1fr] light:border-slate-200 light:bg-white">
      <div class="relative min-h-60 w-full overflow-hidden">
        <img :src="course.thumbnail" :alt="course.title" class="absolute inset-0 size-full object-cover" >
        <div class="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
      </div>

      <div class="flex flex-col justify-center p-5 sm:p-7 lg:px-8">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <CourseStatusBadge :status="course.status" />
          <span class="rounded-md border border-violet-500/35 bg-violet-500/20 px-2.5 py-0.75 text-[11px] font-semibold text-violet-300 light:border-violet-300 light:bg-violet-50 light:text-violet-700">{{ course.category }}</span>
          <span class="rounded-md border border-white/10 bg-white/6 px-2.5 py-0.75 text-[11px] font-semibold text-white/80 light:border-slate-200 light:bg-slate-100 light:text-slate-600">{{ course.level }}</span>
          <span v-if="course.rating > 0" class="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/15 px-2.5 py-0.75 text-[11px] font-semibold text-amber-400 light:border-amber-200 light:bg-amber-50 light:text-amber-600">
            <Star :size="12" class="fill-amber-400 text-amber-400" />
            {{ course.rating.toFixed(1) }} Rating
          </span>
        </div>

        <h1 class="text-2xl leading-tight font-extrabold text-slate-50 sm:text-[26px] light:text-slate-900">{{ course.title }}</h1>
        <p class="mt-2.5 text-[13px] leading-relaxed text-white/60 light:text-slate-600">{{ course.description }}</p>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4.5 light:border-slate-200">
          <div class="flex items-center gap-2.5">
            <img
              :src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(course.instructor || 'Instructor')}&backgroundColor=b6e3f4`"
              alt="Instructor"
              class="size-9 rounded-full border-2 border-violet-500/40"
            >
            <div>
              <span class="block text-[10px] tracking-wide text-white/40 uppercase light:text-slate-500">Taught by</span>
              <span class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ course.instructor }}</span>
            </div>
          </div>

          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-extrabold text-emerald-400 light:text-emerald-700">${{ course.price.toFixed(2) }}</span>
            <span v-if="course.originalPrice > course.price" class="text-[13px] text-white/35 line-through light:text-slate-400">
              ${{ course.originalPrice.toFixed(2) }}
            </span>
            <span v-if="course.sale" class="text-xs font-semibold text-rose-300 light:text-rose-600">
              On sale for ${{ Number(course.sale.salePrice).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Course Revenue"
        :value="course.revenue"
        format="currency"
        sub="Gross earnings generated"
        :icon="DollarSign"
        accent-color="#8b5cf6"
      />
      <StatCard
        label="Enrolled Students"
        :value="course.totalStudents"
        format="number"
        sub="Active learning registrations"
        :icon="Users"
        accent-color="#3b82f6"
      />
      <StatCard
        label="Curriculum Volume"
        :value="`${course.totalHours} hrs`"
        :sub="`${course.totalLessons} structured lessons`"
        :icon="Clock"
        accent-color="#10b981"
      />
      <StatCard
        label="Completion Rate"
        :value="course.completionRate"
        format="percent"
        sub="Average student graduation"
        :icon="GraduationCap"
        accent-color="#f59e0b"
      />
    </div>

    <!-- Course Monthly Performance Chart -->
    <SalesChart
      :title="`${course.title} - Performance`"
      subtitle="Monthly sales and enrollment progression for this specific course"
      :months="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']"
      :monthly-revenue="course.monthlyRevenue || []"
      :monthly-enrollments="course.monthlyEnrollments || []"
    />

    <!-- Two-Column: Enrolled Students List & Course Metadata -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <!-- Enrolled Students Table -->
      <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 lg:col-span-2 light:border-slate-200 light:bg-white">
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Enrolled Students</h3>
            <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">Students actively studying this program</p>
          </div>
          <span class="rounded-full border border-violet-500/30 bg-violet-500/20 px-2.25 py-0.75 text-[11px] font-semibold text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">
            {{ enrolledStudents.length }} Enrolled
          </span>
        </div>

        <div v-if="enrolledStudents.length === 0" class="px-2.5 py-10 text-center text-[13px] text-white/40 light:text-slate-500">
          <Users :size="28" class="mx-auto mb-2 text-white/30 light:text-slate-300" />
          <p>No students enrolled in this course yet.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr>
                <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Student</th>
                <th class="hidden border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase sm:table-cell light:border-slate-200 light:text-slate-500">Country</th>
                <th class="border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase light:border-slate-200 light:text-slate-500">Status</th>
                <th class="hidden border-b border-white/8 px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-white/40 uppercase md:table-cell light:border-slate-200 light:text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in enrolledStudents" :key="s.id" class="transition-colors hover:bg-white/3 light:hover:bg-slate-50">
                <td class="border-b border-white/4 px-3 py-3 light:border-slate-100">
                  <div class="flex items-center gap-2.5">
                    <img :src="s.avatar" :alt="s.name" class="size-8 shrink-0 rounded-full bg-violet-500/20" >
                    <div class="flex flex-col">
                      <span class="font-semibold text-slate-100 light:text-slate-900">{{ s.name }}</span>
                      <span class="text-[11px] text-white/40 light:text-slate-500">{{ s.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="hidden border-b border-white/4 px-3 py-3 sm:table-cell light:border-slate-100">
                  <span class="text-xs text-white/70 light:text-slate-600">{{ s.country }}</span>
                </td>
                <td class="border-b border-white/4 px-3 py-3 light:border-slate-100">
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize" :class="statusClass(s.status)">
                    {{ s.status }}
                  </span>
                </td>
                <td class="hidden border-b border-white/4 px-3 py-3 md:table-cell light:border-slate-100">
                  <span class="text-[11px] text-white/45 light:text-slate-500">{{ s.joinedAt }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Course Tags & Details Sidebar -->
      <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
        <h3 class="mb-3 text-base font-bold text-slate-100 light:text-slate-900">Course Specifications</h3>

        <div class="flex flex-col gap-3">
          <div class="flex justify-between gap-4 border-b border-white/4 pb-2 text-[13px] light:border-slate-100">
            <span class="text-white/45 light:text-slate-500">Category:</span>
            <span class="font-semibold text-slate-200 light:text-slate-800">{{ course.category }}</span>
          </div>
          <div class="flex justify-between gap-4 border-b border-white/4 pb-2 text-[13px] light:border-slate-100">
            <span class="text-white/45 light:text-slate-500">Skill Level:</span>
            <span class="font-semibold text-slate-200 light:text-slate-800">{{ course.level }}</span>
          </div>
          <div class="flex justify-between gap-4 border-b border-white/4 pb-2 text-[13px] light:border-slate-100">
            <span class="text-white/45 light:text-slate-500">Total Lessons:</span>
            <span class="font-semibold text-slate-200 light:text-slate-800">{{ course.totalLessons }} modules</span>
          </div>
          <div class="flex justify-between gap-4 border-b border-white/4 pb-2 text-[13px] light:border-slate-100">
            <span class="text-white/45 light:text-slate-500">Video Duration:</span>
            <span class="font-semibold text-slate-200 light:text-slate-800">{{ course.totalHours }} hours</span>
          </div>
          <div class="flex justify-between gap-4 border-b border-white/4 pb-2 text-[13px] light:border-slate-100">
            <span class="text-white/45 light:text-slate-500">Initial Launch:</span>
            <span class="font-semibold text-slate-200 light:text-slate-800">{{ course.createdAt }}</span>
          </div>
          <div class="flex justify-between gap-4 border-b border-white/4 pb-2 text-[13px] light:border-slate-100">
            <span class="text-white/45 light:text-slate-500">Last Updated:</span>
            <span class="font-semibold text-slate-200 light:text-slate-800">{{ course.updatedAt }}</span>
          </div>
        </div>

        <div class="mt-5">
          <span class="mb-2 block text-[13px] text-white/45 light:text-slate-500">Technologies &amp; Tags:</span>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="tag in course.tags" :key="tag" class="rounded-md border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Curriculum & review management -->
    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <CurriculumEditor :slug="course.slug" @changed="refresh" />
      <CourseReviews :slug="course.slug" can-moderate @changed="refresh" />
    </div>

    <!-- Modals -->
    <CourseFormModal
      :is-open="isEditModalOpen"
      :course="course"
      :loading="saving"
      @close="isEditModalOpen = false"
      @submit="handleUpdateCourse"
    />

    <ConfirmDeleteModal
      :is-open="isDeleteModalOpen"
      :item-name="course.title"
      :loading="deleting"
      @close="isDeleteModalOpen = false"
      @confirm="handleDeleteCourse"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Star,
  DollarSign,
  Users,
  Clock,
  GraduationCap,
  AlertCircle
} from 'lucide-vue-next'
import type { Course, CourseFormData, Student } from '~/types'
import CourseStatusBadge from '~/components/courses/CourseStatusBadge.vue'
import StatCard from '~/components/shared/StatCard.vue'
import SalesChart from '~/components/dashboard/SalesChart.vue'
import CourseFormModal from '~/components/courses/CourseFormModal.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import CurriculumEditor from '~/components/courses/CurriculumEditor.vue'
import CourseReviews from '~/components/learning/CourseReviews.vue'
import LearnerCourseView from '~/components/learning/LearnerCourseView.vue'
import { useCourses } from '~/composables/useCourses'

const auth = useAuth()
const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug))

const { updateCourse, deleteCourse } = useCourses()

const { data: course, pending, error, refresh } = await useAsyncData<Course>(
  `course-detail-${slug.value}`,
  () => $fetch<Course>(`/api/courses/${slug.value}`),
  { server: false }
)

useHead({
  title: computed(() => {
    if (!course.value?.title) return 'Course Details'
    return auth.isAdmin ? `${course.value.title} - Analytics` : course.value.title
  })
})

const enrolledStudents = computed<Student[]>(() => {
  return (course.value?.enrolledStudentList || []) as Student[]
})

// Modal states
const isEditModalOpen = ref(false)
const saving = ref(false)
const isDeleteModalOpen = ref(false)
const deleting = ref(false)

function statusClass(status: string) {
  if (status === 'active') return 'bg-emerald-400/15 text-emerald-400 light:bg-emerald-50 light:text-emerald-700'
  if (status === 'inactive') return 'bg-slate-400/15 text-slate-400 light:bg-slate-100 light:text-slate-600'
  return 'bg-violet-400/15 text-violet-300 light:bg-violet-50 light:text-violet-700'
}

async function handleUpdateCourse(formData: CourseFormData) {
  saving.value = true
  try {
    await updateCourse(slug.value, formData)
    isEditModalOpen.value = false
    await refresh()
  } catch (err: unknown) {
    alert((err as Error).message || 'Failed to update course')
  } finally {
    saving.value = false
  }
}

async function handleDeleteCourse() {
  deleting.value = true
  try {
    await deleteCourse(slug.value)
    isDeleteModalOpen.value = false
    router.push('/courses')
  } catch (err: unknown) {
    alert((err as Error).message || 'Failed to delete course')
  } finally {
    deleting.value = false
  }
}
</script>
