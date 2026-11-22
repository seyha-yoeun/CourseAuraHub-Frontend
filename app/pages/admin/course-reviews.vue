<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Course Reviews') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Instructors\' courses waiting for approval. Approving publishes the course.') }}</p>
    </div>

    <div v-if="pending" class="h-40 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">{{ getErrorMessage(error, t('Unable to load courses waiting for review')) }}</p>
    <p v-else-if="!courses.length" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">{{ t('No courses are waiting for review.') }}</p>

    <DataTableFrame v-else :label="t('Courses waiting for review')" :scroll-key="tableScrollKey">
      <table class="w-full min-w-180 border-collapse text-left text-[13px]">
        <thead>
          <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
            <th class="px-4 py-3 font-semibold">{{ t('Course') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Instructor') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Lessons') }}</th>
            <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="course in tableItems" :key="course.id">
            <td class="px-4 py-3">
              <NuxtLink :to="`/courses/${course.slug}`" class="font-semibold text-brand-300 no-underline light:text-brand-700">{{ course.title }}</NuxtLink>
              <span class="block text-xs text-white/45 light:text-slate-500">{{ course.category }} · {{ formatMoney(course.price) }}</span>
            </td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ course.instructor }}</td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ course.totalLessons }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button type="button" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-brand-500/35 bg-brand-500/15 text-brand-300 hover:bg-brand-500/25 light:border-brand-200 light:bg-brand-50 light:text-brand-700" :disabled="busySlug === course.slug" @click="approve(course)">{{ t('Approve') }}</button>
              <button type="button" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 light:border-rose-200 light:bg-rose-50 light:text-rose-600 ml-2" :disabled="busySlug === course.slug" @click="rejecting = course">{{ t('Send Back') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <template #footer>
        <TablePagination v-model:page="tablePage" v-model:page-size="tablePageSize" :total="tableTotal" />
      </template>
    </DataTableFrame>

    <section class="flex flex-col gap-3">
      <div>
        <h2 :class="sectionTitle">{{ t('Changes to live courses') }}</h2>
        <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ t('Edits instructors made to published courses. Learners keep seeing the current version until you approve.') }}</p>
      </div>

      <div v-if="revisionsPending" class="h-24 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
      <p v-else-if="revisionsError" :class="emptyBox">{{ getErrorMessage(revisionsError, t('Unable to load course changes')) }}</p>
      <p v-else-if="!revisions.length" :class="emptyBox">{{ t('No course changes are waiting for review.') }}</p>

      <ul v-else class="m-0 flex list-none flex-col gap-3 p-0">
        <li v-for="revision in revisions" :key="revision.id" :class="cardClass">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <NuxtLink :to="`/courses/${revision.courseSlug}`" class="font-semibold text-brand-300 no-underline light:text-brand-700">{{ revision.courseTitle }}</NuxtLink>
              <p class="text-xs text-white/45 light:text-slate-500">{{ t('Submitted {updatedAt}', { updatedAt: formatDateTime(revision.updatedAt) }) }}</p>
              <p v-if="revision.summary" class="mt-1.5 text-[13px] text-white/75 light:text-slate-700">{{ revision.summary }}</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button" :class="primaryAction" :disabled="busyRevision === revision.id" @click="approveChanges(revision)">{{ t('Approve') }}</button>
              <button type="button" :class="dangerAction" :disabled="busyRevision === revision.id" @click="rejectingRevision = revision">{{ t('Send Back') }}</button>
            </div>
          </div>
          <RevisionChanges :changes="revision.changes" class="mt-3" />
        </li>
      </ul>
    </section>

    <PromptModal
      :is-open="Boolean(rejectingRevision)"
      :title="`Send Back Changes to ${rejectingRevision?.courseTitle ?? ''}`"
      :description="t('The instructor sees this note. The live course stays as it is.')"
      :label="t('What to change')"
      :confirm-label="t('Send Back')"
      tone="danger"
      required
      :maxlength="2000"
      :loading="busyRevision === rejectingRevision?.id"
      @close="rejectingRevision = null"
      @confirm="rejectChanges"
    />

    <Teleport to="body">
      <div v-if="rejecting" class="fixed inset-0 z-100 flex items-center justify-center bg-[#060b09]/82 p-4 backdrop-blur-xl" @click.self="rejecting = null">
        <form class="w-full max-w-120 rounded-[20px] border border-brand-500/25 bg-[#101814] p-5 light:border-brand-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="reject-course-title" @submit.prevent="reject">
          <h2 id="reject-course-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ t('Send Back {title}', { title: rejecting.title }) }}</h2>
          <p class="mt-1 text-xs text-white/45 light:text-slate-500">{{ t('The instructor sees this and can resubmit.') }}</p>
          <textarea v-model="note" rows="3" required maxlength="1000" :aria-label="t('What to change')" class="w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 mt-3" />
          <div class="mt-3 flex justify-end gap-2">
            <button type="button" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-white/10 bg-white/5 text-white/75 hover:bg-white/9 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700" @click="rejecting = null">{{ t('Cancel') }}</button>
            <button type="submit" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 light:border-rose-200 light:bg-rose-50 light:text-rose-600" :disabled="busySlug === rejecting.slug || !note.trim()">{{ t('Send Back') }}</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { useClientPagination } from '~/composables/useClientPagination'
import type { Course } from '~/types'
import type { CourseRevision } from '~/types/revision'
import RevisionChanges from '~/components/courses/RevisionChanges.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { formatMoney } from '~/composables/useCart'
import { useInstructor } from '~/composables/useInstructor'
import { useRevisions } from '~/composables/useRevisions'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'
import { cardClass, dangerAction, emptyBox, primaryAction, sectionTitle } from '~/utils/ui'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Course Reviews') })

const toast = useAppToast()
const { fetchAwaitingReview, approveCourse, rejectCourse } = useInstructor()
const { fetchAwaitingReview: fetchRevisionsAwaitingReview, approve: approveRevision, reject: rejectRevision } = useRevisions()

const { data, pending, error, refresh } = await useAsyncData('course-reviews', fetchAwaitingReview, { server: false })
const courses = computed(() => data.value ?? [])
const { page: tablePage, pageSize: tablePageSize, total: tableTotal, items: tableItems, scrollKey: tableScrollKey } = useClientPagination(courses)

const busySlug = ref<string | null>(null)
const rejecting = ref<Course | null>(null)
const note = ref('')

async function approve(course: Course) {
  busySlug.value = course.slug
  try {
    await approveCourse(course.slug)
    toast.success(t('Course Approved'), `${course.title} is now live.`)
    await refresh()
  } catch (err) {
    toast.error(t('Course Not Approved'), getErrorMessage(err, t('Unable to approve this course')))
  } finally {
    busySlug.value = null
  }
}

async function reject() {
  const course = rejecting.value
  if (!course) return

  busySlug.value = course.slug
  try {
    await rejectCourse(course.slug, note.value.trim())
    toast.info(t('Course Sent Back'), course.title)
    rejecting.value = null
    note.value = ''
    await refresh()
  } catch (err) {
    toast.error(t('Course Not Sent Back'), getErrorMessage(err, t('Unable to send this course back')))
  } finally {
    busySlug.value = null
  }
}

const {
  data: revisionData,
  pending: revisionsPending,
  error: revisionsError,
  refresh: refreshRevisions,
} = await useAsyncData('course-revisions', fetchRevisionsAwaitingReview, { server: false })
const revisions = computed(() => revisionData.value ?? [])
const busyRevision = ref<number | null>(null)
const rejectingRevision = ref<CourseRevision | null>(null)

async function approveChanges(revision: CourseRevision) {
  busyRevision.value = revision.id
  try {
    await approveRevision(revision.id)
    toast.success(t('Changes Approved'), `${revision.courseTitle} is updated.`)
    await refreshRevisions()
  } catch (err) {
    toast.error(t('Changes Not Approved'), getErrorMessage(err, t('Unable to approve the changes')))
  } finally {
    busyRevision.value = null
  }
}

async function rejectChanges(note: string) {
  const revision = rejectingRevision.value
  if (!revision) return
  busyRevision.value = revision.id
  try {
    await rejectRevision(revision.id, note)
    toast.info(t('Changes Sent Back'), revision.courseTitle)
    rejectingRevision.value = null
    await refreshRevisions()
  } catch (err) {
    toast.error(t('Changes Not Sent Back'), getErrorMessage(err, t('Unable to send the changes back')))
  } finally {
    busyRevision.value = null
  }
}
</script>
