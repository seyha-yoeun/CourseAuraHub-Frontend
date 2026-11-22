<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <NuxtLink to="/learning-paths" class="inline-flex w-fit items-center gap-1.5 rounded-sm text-[13px] font-semibold text-brand-300 no-underline hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-brand-600 light:hover:text-brand-700">
      <ArrowLeft :size="15" aria-hidden="true" /> {{ t('All learning paths') }}
    </NuxtLink>

    <div v-if="pending" class="flex flex-col gap-4">
      <div class="h-28 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
      <div v-for="i in 3" :key="i" class="h-32 w-full animate-pulse rounded-[14px] bg-white/5 lg:w-[calc(50%-1.5rem)] light:bg-slate-100" :class="i === 2 && 'lg:self-end'" />
    </div>
    <div v-else-if="error || !path" class="flex flex-col items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.03] px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="36" class="text-rose-300 light:text-negative" aria-hidden="true" />
      <h1 class="mt-3 text-xl font-bold text-slate-50 light:text-slate-900">{{ t('Learning path not found') }}</h1>
    </div>

    <template v-else>
      <!-- Header: what the path is, and where you are in it -->
      <header class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0 max-w-2xl">
          <p class="text-[11.5px] font-semibold tracking-[0.12em] text-brand-300 uppercase light:text-brand-600">{{ t('Learning path') }}</p>
          <h1 class="mt-2 text-[28px] leading-tight font-bold tracking-[-0.02em] text-slate-50 sm:text-[34px] light:text-slate-900">{{ path.title }}</h1>
          <p v-if="path.description" class="mt-2 text-[14px] leading-relaxed whitespace-pre-line text-white/65 light:text-slate-600">{{ path.description }}</p>
          <p class="mt-2 text-[13px] text-white/45 light:text-slate-500">
            {{ t('{count} courses', { count: path.courseCount }) }} · {{ t('{count} lessons', { count: path.totalLessons }) }} · {{ t('{hours} hours', { hours: Number(path.totalHours).toFixed(1) }) }} · {{ t('Certificate when you finish every course') }}
          </p>
        </div>

        <div class="w-full shrink-0 rounded-[14px] border border-white/10 bg-white/[0.03] p-4 lg:w-80 light:border-slate-200 light:bg-white">
          <template v-if="progress">
            <div class="flex items-baseline justify-between gap-3 text-[13px]">
              <span class="font-semibold text-slate-100 light:text-slate-800">{{ t('{done} of {total} courses completed', { done: progress.completedCourses, total: progress.totalCourses }) }}</span>
              <span class="font-semibold text-brand-300 tabular-nums light:text-brand-600">{{ progress.percent }}%</span>
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8 light:bg-slate-100" role="progressbar" :aria-valuenow="progress.percent" aria-valuemin="0" aria-valuemax="100" :aria-label="t('Path progress')">
              <div class="h-full rounded-full bg-brand-400 transition-[width] duration-500 light:bg-brand-500" :style="{ width: `${progress.percent}%` }" />
            </div>
          </template>
          <p class="text-[13px] text-white/50 light:text-slate-500" :class="progress && 'mt-2.5'">
            <template v-if="Number(path.price) > 0">
              <span class="font-semibold text-slate-100 light:text-slate-900">{{ formatMoney(path.price) }}</span> {{ t('for all courses, at today\'s prices') }}
            </template>
            <span v-else class="font-semibold text-slate-100 light:text-slate-900">{{ t('Free') }}</span>
          </p>

          <!-- One main action, depending on where the learner is -->
          <div class="mt-4 flex flex-col gap-2">
            <template v-if="progress?.certificate">
              <button type="button" :class="primaryButton" :disabled="downloading" @click="downloadCertificate(progress.certificate.certificateNumber)">
                <Loader2 v-if="downloading" :size="15" class="animate-spin" aria-hidden="true" />
                <Download v-else :size="15" aria-hidden="true" />
                {{ t('Download path certificate') }}
              </button>
              <NuxtLink :to="`/certificates/${progress.certificate.certificateNumber}`" class="text-center text-[12.5px] font-semibold text-brand-300 hover:underline light:text-brand-600">
                {{ t('View verification page') }}
              </NuxtLink>
            </template>
            <NuxtLink
              v-else-if="!auth.isAuthenticated"
              :to="{ path: '/auth/login', query: { redirect: `/learning-paths/${path.slug}` } }"
              :class="primaryButton"
            >
              {{ t('Sign in to start this path') }}
            </NuxtLink>
            <template v-else-if="hasUnenrolledCourses">
              <button type="button" :class="primaryButton" :disabled="enrolling" @click="enroll">
                <Loader2 v-if="enrolling" :size="15" class="animate-spin" aria-hidden="true" />
                {{ progress && progress.enrolledCourses > 0 ? t('Enroll in remaining courses') : t('Enroll in path') }}
              </button>
              <p v-if="hasPaidCourses" class="text-[12px] leading-snug text-white/45 light:text-slate-500">
                {{ t('Free courses start right away. Paid courses are added to your cart for checkout.') }}
              </p>
            </template>
            <NuxtLink v-else-if="nextCourse" :to="`/learn/${nextCourse.slug}`" :class="primaryButton">
              <PlayCircle :size="15" aria-hidden="true" />
              {{ t('Continue: {title}', { title: nextCourse.title }) }}
            </NuxtLink>
          </div>
        </div>
      </header>

      <!-- Roadmap -->
      <section aria-labelledby="path-courses-title">
        <h2 id="path-courses-title" class="border-b border-white/8 pb-3 text-[15px] font-semibold text-slate-50 light:border-slate-200 light:text-slate-900">{{ t('Courses in this path') }}</h2>

        <ol class="m-0 list-none p-0 pt-2">
          <li
            v-for="(step, index) in steps"
            :key="step.course.slug"
            class="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] lg:gap-x-0"
          >
            <!-- Spine segment + node, coloured by this step's status -->
            <div class="relative col-start-1 row-start-1 flex justify-center lg:col-start-2" aria-hidden="true">
              <span class="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2" :class="lineClass(step.state)" />
              <span class="relative z-1 mt-9 size-3 rounded-full ring-4 ring-zinc-950 light:ring-slate-50" :class="dotClass(step.state)" />
            </div>

            <!-- Course card: alternates sides on wide screens -->
            <div class="col-start-2 row-start-1 py-2.5" :class="index % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-3'">
              <article class="relative rounded-[14px] border bg-white/[0.03] p-4 transition-colors light:bg-white" :class="cardClass(step.state)">
                <!-- Connector from the card to the spine -->
                <span
                  class="absolute top-[31px] hidden w-6 border-t-2 lg:block"
                  :class="[lineClass(step.state), index % 2 === 0 ? '-right-6' : '-left-6']"
                  aria-hidden="true"
                />

                <div class="flex items-start gap-3">
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold tabular-nums" :class="badgeClass(step.state)">
                    <Check v-if="step.state === 'completed'" :size="15" :stroke-width="3" aria-hidden="true" />
                    <template v-else>{{ index + 1 }}</template>
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <NuxtLink :to="`/courses/${step.course.slug}`" class="min-w-0 text-[15px] leading-snug font-semibold text-slate-50 no-underline hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-900 light:hover:text-brand-600">
                        {{ step.course.title }}
                      </NuxtLink>
                      <span v-if="progress?.nextCourseSlug === step.course.slug" class="rounded-md bg-brand-500/15 px-1.5 py-px text-[11px] font-semibold text-brand-300 light:bg-brand-50 light:text-brand-600">{{ t('Up next') }}</span>
                    </div>
                    <p class="mt-1 inline-flex items-center gap-1.5 text-[12.5px]" :class="step.state === 'completed' ? 'text-brand-300 light:text-brand-600' : 'text-white/45 light:text-slate-500'">
                      <Award :size="13" aria-hidden="true" /> {{ t('Certificate of completion') }}
                    </p>
                  </div>
                  <div class="relative hidden w-20 shrink-0 overflow-hidden rounded-md sm:block" aria-hidden="true">
                    <img :src="step.course.thumbnail" alt="" class="aspect-video w-full object-cover" :class="step.state === 'todo' && 'opacity-60 grayscale'" loading="lazy">
                    <span v-if="step.state === 'todo'" class="absolute inset-0 flex items-center justify-center">
                      <span class="flex size-6 items-center justify-center rounded-full bg-black/60 text-white"><Lock :size="12" /></span>
                    </span>
                  </div>
                </div>

                <!-- Footer: status or the next action -->
                <div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
                  <span class="text-white/50 light:text-slate-500">{{ step.course.level }} · {{ t('{lessons} lessons', { lessons: step.course.totalLessons }) }}</span>

                  <span v-if="step.state === 'completed'" class="font-semibold text-brand-300 light:text-brand-600">100% · {{ t('Completed') }}</span>
                  <NuxtLink v-else-if="step.state === 'in-progress'" :to="`/learn/${step.course.slug}`" class="inline-flex items-center gap-1 font-semibold text-amber-300 no-underline hover:underline light:text-warning">
                    {{ step.percent }}% · {{ t('Continue') }} <ArrowRight :size="13" aria-hidden="true" />
                  </NuxtLink>
                  <NuxtLink
                    v-else
                    :to="`/courses/${step.course.slug}`"
                    class="inline-flex h-8 items-center rounded-lg bg-brand-500 px-3 text-[12.5px] font-semibold text-white no-underline transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
                  >
                    {{ Number(step.course.price) > 0 ? t('Enroll · {price}', { price: formatMoney(step.course.price) }) : t('Start free') }}
                  </NuxtLink>
                </div>
                <div v-if="step.state !== 'todo'" class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8 light:bg-slate-100" aria-hidden="true">
                  <div class="h-full rounded-full" :class="step.state === 'completed' ? 'bg-brand-400 light:bg-brand-500' : 'bg-amber-400'" :style="{ width: `${step.percent}%` }" />
                </div>
              </article>
            </div>
          </li>

          <!-- Finish line: the path certificate -->
          <li class="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] lg:gap-x-0">
            <div class="relative col-start-1 row-start-1 flex justify-center lg:col-start-2" aria-hidden="true">
              <span class="absolute top-0 left-1/2 h-5 -translate-x-1/2 border-l-2" :class="lineClass(progress?.completed ? 'completed' : 'todo')" />
            </div>
            <div class="col-start-2 row-start-1 flex pt-5 lg:col-span-3 lg:col-start-1 lg:justify-center">
              <component
                :is="progress?.certificate ? 'button' : 'div'"
                :type="progress?.certificate ? 'button' : undefined"
                class="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold"
                :class="progress?.certificate
                  ? 'cursor-pointer border-brand-400/50 bg-brand-500/15 text-brand-200 hover:bg-brand-500/25 light:border-brand-300 light:bg-brand-50 light:text-brand-700'
                  : 'border-white/12 text-white/60 light:border-slate-200 light:bg-white light:text-slate-600'"
                @click="progress?.certificate && downloadCertificate(progress.certificate.certificateNumber)"
              >
                <Award :size="16" aria-hidden="true" />
                {{ t('{title} certificate', { title: path.title }) }}
                <span v-if="progress?.certificate" class="text-[11.5px] font-medium opacity-80">· {{ t('Earned') }}</span>
              </component>
            </div>
          </li>
        </ol>

        <!-- Legend -->
        <dl class="mt-8 inline-grid grid-cols-[auto_3rem] items-center gap-x-6 gap-y-2 rounded-[12px] border border-white/10 px-4 py-3 text-[12.5px] text-white/60 light:border-slate-200 light:bg-white light:text-slate-600">
          <template v-for="item in legend" :key="item.state">
            <dt>{{ t(item.label) }}</dt>
            <dd class="m-0 border-t-2" :class="lineClass(item.state)" />
          </template>
        </dl>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowLeft, ArrowRight, Award, Check, Download, Loader2, Lock, PlayCircle } from 'lucide-vue-next'
import type { Course, MyCourse } from '~/types'
import { formatMoney, useCart } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { useLearning } from '~/composables/useLearning'
import { useLearningPaths } from '~/composables/useLearningPaths'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
const auth = useAuth()
const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const cart = useCart()
const { fetchPath, fetchProgress, enrollInPath, downloadPathCertificate } = useLearningPaths()
const { fetchMyCourses } = useLearning()
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

// Per-course lesson progress (the path progress only says enrolled/completed per course)
const { data: myCourses, refresh: refreshMyCourses } = await useAsyncData(
  'learning-path-my-courses',
  () => (auth.isAuthenticated ? fetchMyCourses().catch(() => [] as MyCourse[]) : Promise.resolve([] as MyCourse[])),
  { server: false, watch: [() => auth.isAuthenticated] }
)

useHead({ title: computed(() => path.value?.title ?? t('Learning path')) })

const primaryButton = 'inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-brand-500 px-4 text-[13.5px] font-semibold text-white no-underline transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait disabled:opacity-60'

type StepState = 'completed' | 'in-progress' | 'todo'

const legend: { state: StepState, label: string }[] = [
  { state: 'completed', label: 'Completed' },
  { state: 'in-progress', label: 'In progress' },
  { state: 'todo', label: 'Not started' },
]

const steps = computed(() => (path.value?.courses ?? []).map((course: Course) => {
  const pathStep = progress.value?.courses.find(item => item.slug === course.slug)
  const mine = myCourses.value?.find(item => item.slug === course.slug)
  const completed = Boolean(pathStep?.completed || mine?.progress.completed)
  const enrolled = Boolean(pathStep?.enrolled || mine)
  const state: StepState = completed ? 'completed' : enrolled ? 'in-progress' : 'todo'
  const percent = completed ? 100 : Math.round(mine?.progress.progressPercent ?? 0)
  return { course, state, percent }
}))

const nextCourse = computed(() => {
  const slug = progress.value?.nextCourseSlug
  return slug ? path.value?.courses.find(course => course.slug === slug) ?? null : null
})

function lineClass(state: StepState) {
  if (state === 'completed') return 'border-solid border-brand-400 light:border-brand-500'
  if (state === 'in-progress') return 'border-dashed border-amber-400'
  return 'border-solid border-white/15 light:border-slate-300'
}

function dotClass(state: StepState) {
  if (state === 'completed') return 'bg-brand-400 light:bg-brand-500'
  if (state === 'in-progress') return 'bg-amber-400'
  return 'bg-white/25 light:bg-slate-300'
}

function cardClass(state: StepState) {
  if (state === 'completed') return 'border-brand-400/40 light:border-brand-300'
  if (state === 'in-progress') return 'border-amber-400/45 light:border-amber-300'
  return 'border-white/10 light:border-slate-200'
}

function badgeClass(state: StepState) {
  if (state === 'completed') return 'bg-brand-500 text-white'
  if (state === 'in-progress') return 'bg-amber-400/15 text-amber-300 light:bg-amber-50 light:text-warning'
  return 'bg-white/6 text-white/60 light:bg-slate-100 light:text-slate-500'
}

const enrolling = ref(false)
const downloading = ref(false)

const hasPaidCourses = computed(() => path.value?.courses.some(course => Number(course.price) > 0) ?? false)
const hasUnenrolledCourses = computed(() => !progress.value || progress.value.enrolledCourses < progress.value.totalCourses)

async function enroll() {
  enrolling.value = true
  try {
    const outcome = await enrollInPath(slug.value)
    await Promise.all([refreshProgress(), refreshMyCourses()])
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
