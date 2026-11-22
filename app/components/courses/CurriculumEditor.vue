<template>
  <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Curriculum') }}</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">
          <template v-if="curriculum">
            {{ t('{sections} sections · {totalLessons} lessons · {totalDurationMinutes}', { sections: curriculum.sections.length, totalLessons: curriculum.totalLessons, totalDurationMinutes: formatDuration(curriculum.totalDurationMinutes) }) }}
          </template>
          <template v-else>{{ t('Sections and lessons learners will work through') }}</template>
        </p>
      </div>
      <label v-if="curriculum" class="flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 text-xs text-slate-200 light:border-slate-200 light:bg-slate-50 light:text-slate-700" :title="t('Each lesson opens once the lessons before it are complete')">
        <input type="checkbox" class="size-4 accent-brand-600" :checked="curriculum.sequentialLessons" :disabled="busy" @change="toggleSequential(($event.target as HTMLInputElement).checked)">
        {{ t('Unlock lessons in order') }}
      </label>
    </div>

    <div v-if="pending" class="flex flex-col gap-2.5">
      <div v-for="i in 2" :key="i" class="h-24 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="curriculum" class="flex flex-col gap-3" data-sortable-list>
      <p class="sr-only" aria-live="assertive">{{ drag.announcement.value }}</p>
      <p v-if="curriculum.sections.length > 1 || curriculum.sections.some(item => item.lessons.length > 1)" id="curriculum-order-hint" class="text-[11.5px] text-white/40 light:text-slate-500">
        {{ t('Drag the') }} <GripVertical :size="12" class="inline -mt-px" aria-hidden="true" /> {{ t('handle to reorder sections and lessons, or focus it and use the arrow keys.') }}
      </p>
      <section
        v-for="(section, index) in curriculum.sections"
        :key="section.id"
        data-sortable-item
        class="rounded-xl border transition-shadow"
        :class="drag.isDragging('sections', index)
          ? 'border-brand-400/60 bg-[#16211c] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.6)] light:border-brand-400 light:bg-white'
          : 'border-white/8 bg-white/3 light:border-slate-200 light:bg-slate-50'"
        :style="drag.itemStyle('sections', index)"
      >
        <header class="flex flex-wrap items-center gap-2 border-b border-white/6 px-2 py-2.5 light:border-slate-200">
          <button
            v-if="curriculum.sections.length > 1"
            type="button"
            data-sortable-handle
            class="flex size-7 shrink-0 touch-none items-center justify-center rounded-md text-white/35 hover:bg-white/6 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-not-allowed disabled:opacity-40 light:text-slate-400 light:hover:bg-slate-200/70 light:hover:text-slate-700"
            :class="drag.isDragging('sections', index) ? 'cursor-grabbing' : 'cursor-grab'"
            :disabled="busy"
            :aria-label="`Reorder section ${section.title}, position ${index + 1} of ${curriculum.sections.length}`"
            aria-describedby="curriculum-order-hint"
            @pointerdown="drag.onPointerDown($event, 'sections', index, listOf($event))"
            @keydown="drag.onHandleKeydown($event, 'sections', index, curriculum.sections.length)"
          >
            <GripVertical :size="15" aria-hidden="true" />
          </button>
          <span class="text-[11px] font-bold text-white/35 tabular-nums light:text-slate-400">{{ index + 1 }}</span>
          <form v-if="editingSectionId === section.id" class="flex min-w-0 flex-1 items-center gap-2" @submit.prevent="saveSectionTitle(section.id)">
            <input
              ref="sectionTitleInput"
              v-model="sectionTitleDraft"
              type="text"
              maxlength="200"
              required
              :aria-label="t('Section title')"
              :class="inputClass"
              @keydown.esc="editingSectionId = null"
            >
            <button type="submit" :class="iconButtonClass" :aria-label="t('Save section title')" :disabled="busy"><Check :size="14" /></button>
            <button type="button" :class="iconButtonClass" :aria-label="t('Cancel')" @click="editingSectionId = null"><X :size="14" /></button>
          </form>
          <template v-else>
            <span class="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ section.title }}</span>
            <button type="button" :class="iconButtonClass" :aria-label="`Move ${section.title} up`" :disabled="busy || index === 0" @click="moveSection(index, -1)"><ArrowUp :size="14" /></button>
            <button type="button" :class="iconButtonClass" :aria-label="`Move ${section.title} down`" :disabled="busy || index === curriculum.sections.length - 1" @click="moveSection(index, 1)"><ArrowDown :size="14" /></button>
            <button type="button" :class="iconButtonClass" :aria-label="`Rename ${section.title}`" @click="startEditSection(section)"><Pencil :size="14" /></button>
            <button type="button" :class="dangerButtonClass" :aria-label="`Delete ${section.title}`" @click="pendingDelete = { kind: 'section', id: section.id, name: section.title }"><Trash2 :size="14" /></button>
          </template>
        </header>

        <ul class="m-0 flex list-none flex-col gap-0.5 p-1.5" data-sortable-list>
          <li
            v-for="(lesson, lessonIndex) in section.lessons"
            :key="lesson.id"
            data-sortable-item
            class="flex items-center gap-2 rounded-lg py-1.5 pr-2.5 pl-1 transition-shadow"
            :class="drag.isDragging(lessonKey(section), lessonIndex)
              ? 'bg-[#16211c] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-brand-400/60 light:bg-white light:ring-brand-400'
              : 'hover:bg-white/4 light:hover:bg-white'"
            :style="drag.itemStyle(lessonKey(section), lessonIndex)"
          >
            <button
              v-if="section.lessons.length > 1"
              type="button"
              data-sortable-handle
              class="flex size-7 shrink-0 touch-none items-center justify-center rounded-md text-white/35 hover:bg-white/6 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-not-allowed disabled:opacity-40 light:text-slate-400 light:hover:bg-slate-200/70 light:hover:text-slate-700"
              :class="drag.isDragging(lessonKey(section), lessonIndex) ? 'cursor-grabbing' : 'cursor-grab'"
              :disabled="busy"
              :aria-label="`Reorder lesson ${lesson.title}, position ${lessonIndex + 1} of ${section.lessons.length}`"
              aria-describedby="curriculum-order-hint"
              @pointerdown="drag.onPointerDown($event, lessonKey(section), lessonIndex, listOf($event))"
              @keydown="drag.onHandleKeydown($event, lessonKey(section), lessonIndex, section.lessons.length)"
            >
              <GripVertical :size="14" aria-hidden="true" />
            </button>
            <span v-else class="w-7 shrink-0" aria-hidden="true" />
            <component :is="typeIcon(lesson.type)" :size="14" class="shrink-0 text-white/40 light:text-slate-400" />
            <span class="min-w-0 flex-1 truncate text-[13px] text-white/80 light:text-slate-700">{{ lesson.title }}</span>
            <span v-if="lesson.releaseAfterDays" class="shrink-0 rounded border border-amber-400/30 bg-amber-400/12 px-1.5 py-px text-[10px] font-semibold text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700" :title="`Opens ${lesson.releaseAfterDays} days after enrolling`">{{ t('Day {releaseAfterDays}', { releaseAfterDays: lesson.releaseAfterDays }) }}</span>
            <span v-if="lesson.preview" class="shrink-0 rounded border border-blue-400/30 bg-blue-400/12 px-1.5 py-px text-[10px] font-semibold text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-700">{{ t('Preview') }}</span>
            <span class="w-12 shrink-0 text-right text-[11px] text-white/40 light:text-slate-500">{{ formatDuration(lesson.durationMinutes) }}</span>
            <button type="button" :class="iconButtonClass" :aria-label="`Move ${lesson.title} up`" :disabled="busy || lessonIndex === 0" @click="moveLesson(section, lessonIndex, -1)"><ArrowUp :size="13" /></button>
            <button type="button" :class="iconButtonClass" :aria-label="`Move ${lesson.title} down`" :disabled="busy || lessonIndex === section.lessons.length - 1" @click="moveLesson(section, lessonIndex, 1)"><ArrowDown :size="13" /></button>
            <LessonCaptionsButton v-if="lesson.type === 'video'" :slug="slug" :lesson="lesson" />
            <button v-if="lesson.type === 'quiz'" type="button" :class="iconButtonClass" :aria-label="`Edit questions for ${lesson.title}`" :title="t('Quiz questions')" @click="quizLesson = lesson"><ListChecks :size="13" /></button>
            <button v-else type="button" :class="iconButtonClass" :aria-label="`Assignment for ${lesson.title}`" :title="t('Assignment')" @click="assignmentLesson = lesson"><ClipboardCheck :size="13" /></button>
            <LessonStudyTextButton :lesson="lesson" />
            <button type="button" :class="iconButtonClass" :aria-label="`Edit ${lesson.title}`" @click="openLessonModal(section, lesson)"><Pencil :size="13" /></button>
            <button type="button" :class="dangerButtonClass" :aria-label="`Delete ${lesson.title}`" @click="pendingDelete = { kind: 'lesson', id: lesson.id, name: lesson.title }"><Trash2 :size="13" /></button>
            <LessonExerciseButton v-if="lesson.type === 'code'" :lesson="lesson" />
          </li>
          <li>
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/10 light:text-brand-700 light:hover:bg-brand-50"
              @click="openLessonModal(section, null)"
            >
              <Plus :size="14" /> {{ t('Add lesson') }}
            </button>
          </li>
        </ul>
      </section>

      <form class="flex items-center gap-2" @submit.prevent="addSection">
        <input v-model="newSectionTitle" type="text" maxlength="200" :placeholder="t('New section title')" :aria-label="t('New section title')" :class="inputClass">
        <button
          type="submit"
          class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border border-brand-500/35 bg-brand-500/15 px-3.5 py-2 text-xs font-semibold text-brand-300 transition-all hover:bg-brand-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 light:border-brand-300 light:bg-brand-50 light:text-brand-700"
          :disabled="busy || !newSectionTitle.trim()"
        >
          <Plus :size="14" /> {{ t('Add section') }}
        </button>
      </form>
    </div>

    <p v-else class="text-[13px] text-white/45 light:text-slate-500">{{ t('Unable to load the curriculum.') }}</p>

    <QuizEditorModal :is-open="Boolean(quizLesson)" :lesson="quizLesson" @close="quizLesson = null" />
    <AssignmentEditorModal :lesson="assignmentLesson" @close="assignmentLesson = null" />

    <LessonFormModal
      :is-open="lessonModal.open"
      :lesson="lessonModal.lesson"
      :section-title="lessonModal.section?.title"
      :loading="busy"
      @close="lessonModal.open = false"
      @submit="saveLesson"
    />

    <ConfirmDeleteModal
      :is-open="Boolean(pendingDelete)"
      :title="pendingDelete?.kind === 'section' ? t('Delete Section') : t('Delete Lesson')"
      :description="pendingDelete?.kind === 'section'
        ? t('The section and every lesson in it will be removed, along with learner progress on those lessons.')
        : t('The lesson and learner progress on it will be removed.')"
      :item-name="pendingDelete?.name"
      :loading="busy"
      @close="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp, Check, ClipboardCheck, Code2, FileText, GripVertical, HelpCircle, ListChecks, Pencil, PlayCircle, Plus, Trash2, X } from 'lucide-vue-next'
import { moveItem, useDragReorder } from '~/composables/useSortableList'
import type { CourseSection, Curriculum, Lesson, LessonFormData, LessonType } from '~/types'
import LessonFormModal from '~/components/courses/LessonFormModal.vue'
import LessonCaptionsButton from '~/components/courses/LessonCaptionsButton.vue'
import AssignmentEditorModal from '~/components/courses/AssignmentEditorModal.vue'
import LessonStudyTextButton from '~/components/courses/LessonStudyTextButton.vue'
import QuizEditorModal from '~/components/courses/QuizEditorModal.vue'
import LessonExerciseButton from '~/components/courses/LessonExerciseButton.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import { formatDuration, useCurriculum } from '~/composables/useCurriculum'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()

const props = defineProps<{ slug: string }>()

// Lesson changes alter the course's lesson and hour totals
const emit = defineEmits<{ changed: [] }>()

const quizLesson = ref<Lesson | null>(null)
const assignmentLesson = ref<Lesson | null>(null)

const api = useCurriculum()
const toast = useAppToast()

const inputClass = 'w-full min-w-0 rounded-[10px] border border-white/10 bg-white/4 px-3 py-2 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/30 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400'
const iconButtonClass = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900'
const dangerButtonClass = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:text-rose-600 light:hover:bg-rose-50'

const curriculum = ref<Curriculum | null>(null)
const pending = ref(true)
const busy = ref(false)
const newSectionTitle = ref('')
const editingSectionId = ref<number | null>(null)
const sectionTitleDraft = ref('')
const sectionTitleInput = ref<HTMLInputElement[] | null>(null)
const pendingDelete = ref<{ kind: 'section' | 'lesson'; id: number; name: string } | null>(null)
const lessonModal = reactive<{ open: boolean; section: CourseSection | null; lesson: Lesson | null }>({
  open: false,
  section: null,
  lesson: null
})

async function load() {
  try {
    curriculum.value = await api.fetchCurriculum(props.slug)
  } catch {
    curriculum.value = null
  } finally {
    pending.value = false
  }
}

// Runs a mutation, reloads the curriculum and reports the outcome
async function mutate(action: () => Promise<unknown>, successTitle: string, failure: string, totalsChanged = false) {
  busy.value = true
  try {
    await action()
    await load()
    if (successTitle) toast.success(successTitle)
    if (totalsChanged) emit('changed')
    return true
  } catch (err) {
    toast.error(t('Curriculum Update Failed'), getErrorMessage(err, failure))
    return false
  } finally {
    busy.value = false
  }
}

async function toggleSequential(enabled: boolean) {
  await mutate(
    () => api.updateSettings(props.slug, enabled),
    enabled ? t('Lessons now unlock in order') : t('All lessons are open'),
    t('Unable to update curriculum settings')
  )
}

async function addSection() {
  const title = newSectionTitle.value.trim()
  if (!title) return
  if (await mutate(() => api.createSection(props.slug, title), t('Section Added'), t('Unable to create section'))) {
    newSectionTitle.value = ''
  }
}

function startEditSection(section: CourseSection) {
  editingSectionId.value = section.id
  sectionTitleDraft.value = section.title
  nextTick(() => sectionTitleInput.value?.[0]?.focus())
}

async function saveSectionTitle(sectionId: number) {
  const title = sectionTitleDraft.value.trim()
  if (!title) return
  if (await mutate(() => api.updateSection(props.slug, sectionId, { title }), '', t('Unable to rename section'))) {
    editingSectionId.value = null
  }
}

// Positions are stored as given (ties fall back to id order), so a move renumbers
// the whole list 0..n-1 and sends only the items whose position changed
function positionUpdates<T extends { id: number; position: number }>(ordered: T[]) {
  return ordered
    .map((item, position) => ({ id: item.id, position, changed: item.position !== position }))
    .filter(item => item.changed)
}

// The new order shows at once; the server is updated in the background and the
// curriculum reloads either way (a failed save puts the old order back).
async function moveSectionTo(from: number, to: number) {
  if (!curriculum.value || busy.value) return
  const ordered = moveItem(curriculum.value.sections, from, to)
  const updates = positionUpdates(ordered)
  curriculum.value.sections = ordered
  const saved = await mutate(
    () => Promise.all(updates.map(u => api.updateSection(props.slug, u.id, { position: u.position }))),
    '',
    t('Unable to reorder sections')
  )
  if (!saved) await load()
}

async function moveLessonTo(section: CourseSection, from: number, to: number) {
  if (busy.value) return
  const ordered = moveItem(section.lessons, from, to)
  const updates = positionUpdates(ordered)
  section.lessons = ordered
  const saved = await mutate(
    () => Promise.all(updates.map(u => api.updateLesson(props.slug, u.id, { position: u.position }))),
    '',
    t('Unable to reorder lessons')
  )
  if (!saved) await load()
}

function moveSection(index: number, direction: -1 | 1) {
  moveSectionTo(index, index + direction)
}

function moveLesson(section: CourseSection, index: number, direction: -1 | 1) {
  moveLessonTo(section, index, index + direction)
}

// Drag-and-drop: one list of sections, plus one list of lessons per section
function lessonKey(section: CourseSection) {
  return `lessons-${section.id}`
}

function sectionFor(key: string) {
  return curriculum.value?.sections.find(section => lessonKey(section) === key)
}

function listOf(event: Event) {
  return (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-sortable-list]')
}

const drag = useDragReorder({
  onReorder: (key, from, to) => {
    if (key === 'sections') {
      moveSectionTo(from, to)
      return
    }
    const section = sectionFor(key)
    if (section) moveLessonTo(section, from, to)
  },
  label: (key, index) => key === 'sections'
    ? `Section ${curriculum.value?.sections[index]?.title ?? ''}`
    : `Lesson ${sectionFor(key)?.lessons[index]?.title ?? ''}`,
})

function openLessonModal(section: CourseSection, lesson: Lesson | null) {
  lessonModal.section = section
  lessonModal.lesson = lesson
  lessonModal.open = true
}

async function saveLesson(data: LessonFormData) {
  const { section, lesson } = lessonModal
  if (!section) return
  const ok = lesson
    ? await mutate(() => api.updateLesson(props.slug, lesson.id, data), t('Lesson Updated'), t('Unable to update lesson'), true)
    : await mutate(() => api.createLesson(props.slug, section.id, data), t('Lesson Added'), t('Unable to create lesson'), true)
  if (ok) lessonModal.open = false
}

async function confirmDelete() {
  const target = pendingDelete.value
  if (!target) return
  const ok = target.kind === 'section'
    ? await mutate(() => api.deleteSection(props.slug, target.id), t('Section Deleted'), t('Unable to delete section'), true)
    : await mutate(() => api.deleteLesson(props.slug, target.id), t('Lesson Deleted'), t('Unable to delete lesson'), true)
  if (ok) pendingDelete.value = null
}

function typeIcon(type: LessonType) {
  if (type === 'code') return Code2
  if (type === 'article') return FileText
  if (type === 'quiz') return HelpCircle
  return PlayCircle
}

watch(() => props.slug, () => {
  pending.value = true
  load()
}, { immediate: true })
</script>
