<template>
  <div class="flex flex-col gap-5">
    <NuxtLink to="/learning-paths" class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-300 no-underline hover:text-violet-200 light:text-violet-700">
      <ArrowLeft :size="15" /> {{ t('All learning paths') }}
    </NuxtLink>

    <div v-if="pending" class="h-72 animate-pulse rounded-[20px] bg-white/5 light:bg-slate-100" />
    <div v-else-if="error || !path" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="40" class="text-rose-400" />
      <h1 class="mt-3 text-xl font-bold text-slate-50 light:text-slate-900">{{ t('Learning path not found') }}</h1>
    </div>

    <template v-else>
      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="flex min-w-0 flex-col gap-5">
          <div>
            <p class="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-violet-400 uppercase light:text-violet-700">
              <Route :size="13" /> {{ t('Learning path') }}
            </p>
            <h1 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[28px] light:text-slate-900">{{ path.title }}</h1>
            <p v-if="path.description" class="mt-2 text-[13px] leading-relaxed whitespace-pre-line text-white/60 light:text-slate-600">{{ path.description }}</p>
          </div>

          <ol class="m-0 flex list-none flex-col gap-3 p-0">
            <li v-for="(course, index) in path.courses" :key="course.slug">
              <NuxtLink
                :to="`/courses/${course.slug}`"
                class="flex items-center gap-4 rounded-[18px] border border-white/10 bg-white/5 p-3.5 no-underline transition-colors hover:border-violet-500/40 light:border-slate-200 light:bg-white"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  :class="stepState(course.slug) === 'completed'
                    ? 'bg-emerald-500 text-zinc-950'
                    : stepState(course.slug) === 'enrolled'
                      ? 'border border-violet-400 text-violet-300 light:text-violet-700'
                      : 'border border-white/20 text-white/50 light:border-slate-300 light:text-slate-500'"
                >
                  <Check v-if="stepState(course.slug) === 'completed'" :size="15" :stroke-width="3" />
                  <template v-else>{{ index + 1 }}</template>
                </span>
                <img :src="course.thumbnail" :alt="course.title" class="hidden h-14 w-24 shrink-0 rounded-lg object-cover sm:block">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ course.title }}</p>
                  <p class="mt-0.5 text-[11px] text-white/45 light:text-slate-500">
                    {{ course.level }} · {{ t('{lessons} lessons', { lessons: course.totalLessons }) }} · {{ course.instructor }}
                  </p>
                </div>
                <span v-if="progress?.nextCourseSlug === course.slug" class="shrink-0 rounded-md bg-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-200 light:bg-violet-50 light:text-violet-700">{{ t('Up next') }}</span>
                <span v-else class="shrink-0 text-xs font-semibold text-white/60 light:text-slate-600">{{ Number(course.price) > 0 ? formatMoney(course.price) : t('Free') }}</span>
              </NuxtLink>
            </li>
          </ol>
        </div>

        <!-- Summary and actions -->
        <aside class="flex flex-col gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5 lg:sticky lg:top-20 light:border-slate-200 light:bg-white">
          <ul class="m-0 flex list-none flex-col gap-2 p-0 text-[13px] text-white/70 light:text-slate-600">
            <li class="flex items-center gap-2"><BookOpen :size="15" class="text-violet-400" /> {{ t('{count} courses', { count: path.courseCount }) }}</li>
            <li class="flex items-center gap-2"><ListChecks :size="15" class="text-blue-400" /> {{ t('{count} lessons', { count: path.totalLessons }) }}</li>
            <li class="flex items-center gap-2"><Clock :size="15" class="text-emerald-400" /> {{ t('{hours} hours', { hours: Number(path.totalHours).toFixed(1) }) }}</li>
            <li class="flex items-center gap-2"><Award :size="15" class="text-amber-400" /> {{ t('Certificate when you finish every course') }}</li>
          </ul>

          <p class="text-xl font-extrabold text-slate-50 light:text-slate-900">
            {{ Number(path.price) > 0 ? formatMoney(path.price) : t('Free') }}
            <span v-if="Number(path.price) > 0" class="block text-[11px] font-normal text-white/40 light:text-slate-500">{{ t('All courses together, at today\'s prices') }}</span>
          </p>

          <template v-if="progress">
            <div>
              <p class="mb-1.5 text-xs font-semibold text-slate-200 light:text-slate-800">
                {{ t('{done} of {total} courses completed', { done: progress.completedCourses, total: progress.totalCourses }) }}
              </p>
              <ProgressBar :value="progress.percent" />
            </div>
            <button
              v-if="progress.certificate"
              type="button"
              class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-[13px] font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:cursor-wait disabled:opacity-60 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700"
              :disabled="downloading"
              @click="downloadCertificate(progress.certificate.certificateNumber)"
            >
              <Loader2 v-if="downloading" :size="15" class="animate-spin" />
              <Award v-else :size="15" />
              {{ t('Download path certificate') }}
            </button>
            <NuxtLink
              v-if="progress.certificate"
              :to="`/certificates/${progress.certificate.certificateNumber}`"
              class="text-center text-xs font-semibold text-violet-300 light:text-violet-700"
            >
              {{ t('View verification page') }}
            </NuxtLink>
          </template>

          <NuxtLink
            v-if="!auth.isAuthenticated"
            :to="{ path: '/auth/login', query: { redirect: `/learning-paths/${path.slug}` } }"
            class="inline-flex items-center justify-center rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white no-underline"
          >
            {{ t('Sign in to start this path') }}
          </NuxtLink>
          <button
            v-else-if="!progress?.completed && hasUnenrolledCourses"
            type="button"
            class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60"
            :disabled="enrolling"
            @click="enroll"
          >
            <Loader2 v-if="enrolling" :size="15" class="animate-spin" />
            {{ t('Enroll in path') }}
          </button>
          <p v-if="auth.isAuthenticated && hasPaidCourses && !progress?.completed" class="text-[11px] text-white/40 light:text-slate-500">
            {{ t('Free courses start right away. Paid courses are added to your cart for checkout.') }}
          </p>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowLeft, Award, BookOpen, Check, Clock, ListChecks, Loader2, Route } from 'lucide-vue-next'
import ProgressBar from '~/components/learning/ProgressBar.vue'
import { formatMoney, useCart } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { useLearningPaths } from '~/composables/useLearningPaths'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
const auth = useAuth()
const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const cart = useCart()
const { fetchPath, fetchProgress, enrollInPath, downloadPathCertificate } = useLearningPaths()
const slug = computed(() => String(route.params.slug))

const { data: path, pending, error } = await useAsyncData(
  () => `learning-path-${slug.value}`,
  () => fetchPath(slug.value),
  { server: false, watch: [slug] }
)

// Signed-in learners also see their progress; visitors get nothing here
const { data: progress, refresh: refreshProgress } = await useAsyncData(
  () => `learning-path-progress-${slug.value}`,
  () => (auth.isAuthenticated ? fetchProgress(slug.value).catch(() => null) : Promise.resolve(null)),
  { server: false, watch: [slug, () => auth.isAuthenticated] }
)

useHead({ title: computed(() => path.value?.title ?? t('Learning path')) })

const enrolling = ref(false)
const downloading = ref(false)

const hasPaidCourses = computed(() => path.value?.courses.some(course => Number(course.price) > 0) ?? false)
const hasUnenrolledCourses = computed(() => !progress.value || progress.value.enrolledCourses < progress.value.totalCourses)

function stepState(courseSlug: string) {
  const step = progress.value?.courses.find(course => course.slug === courseSlug)
  if (step?.completed) return 'completed'
  return step?.enrolled ? 'enrolled' : 'todo'
}

async function enroll() {
  enrolling.value = true
  try {
    const outcome = await enrollInPath(slug.value)
    await refreshProgress()
    if (outcome.addedToCart.length) {
      await cart.refresh()
      toast.success(
        t('Path started'),
        t('{enrolled} free courses unlocked, {carted} paid courses added to your cart.', { enrolled: outcome.enrolled.length, carted: outcome.addedToCart.length })
      )
      router.push('/cart')
    } else {
      toast.success(t('Path started'), t('You\'re enrolled in every course of this path.'))
    }
  } catch (err) {
    toast.error(t('Not enrolled'), getErrorMessage(err, t('Unable to enroll in this learning path')))
  } finally {
    enrolling.value = false
  }
}

async function downloadCertificate(number: string) {
  downloading.value = true
  try {
    await downloadPathCertificate(number)
  } catch (err) {
    toast.error(t('Download failed'), getErrorMessage(err, t('Unable to download the certificate')))
  } finally {
    downloading.value = false
  }
}
</script>
