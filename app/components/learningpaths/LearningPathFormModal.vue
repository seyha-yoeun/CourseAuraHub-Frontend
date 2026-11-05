<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-[#05050c]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="$emit('close')">
        <div ref="dialogRef" class="max-h-[90dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-[20px] border border-violet-500/25 bg-[#0f1019] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] focus:outline-none sm:p-6 light:border-violet-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="path-modal-title" tabindex="-1">
          <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4.5 light:border-slate-200">
            <h2 id="path-modal-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ path ? 'Edit Learning Path' : 'New Learning Path' }}</h2>
            <button type="button" aria-label="Close" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-500" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>

          <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
            <label class="flex flex-col gap-1.5">
              <span :class="labelClass">Title *</span>
              <input v-model="form.title" type="text" required maxlength="200" placeholder="e.g. Backend Developer" :class="inputClass">
            </label>
            <label class="flex flex-col gap-1.5">
              <span :class="labelClass">Description</span>
              <textarea v-model="form.description" rows="3" maxlength="5000" :class="inputClass" />
            </label>
            <div class="grid gap-3 sm:grid-cols-[1fr_180px]">
              <label class="flex flex-col gap-1.5">
                <span :class="labelClass">Cover image URL</span>
                <input v-model="form.thumbnail" type="url" maxlength="1000" placeholder="Uses the first course's image when empty" :class="inputClass">
              </label>
              <div class="flex flex-col gap-1.5">
                <span :class="labelClass">Status</span>
                <AppDropdown v-model="form.status" :options="statusOptions" aria-label="Status" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span :class="labelClass">Courses, in order</span>
              <ol v-if="selected.length" class="m-0 flex list-none flex-col gap-1.5 p-0">
                <li v-for="(course, index) in selected" :key="course.slug" class="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-2.5 py-1.5 light:border-slate-200 light:bg-slate-50">
                  <span class="w-5 text-center text-[11px] font-bold text-white/40 light:text-slate-400">{{ index + 1 }}</span>
                  <span class="min-w-0 flex-1 truncate text-[13px] text-slate-100 light:text-slate-900">{{ course.title }}</span>
                  <span v-if="course.status !== 'published'" class="shrink-0 rounded bg-amber-400/15 px-1.5 py-px text-[10px] font-semibold text-amber-300 light:bg-amber-50 light:text-amber-700">{{ course.status }}</span>
                  <button type="button" :class="iconButtonClass" :aria-label="`Move ${course.title} up`" :disabled="index === 0" @click="move(index, -1)"><ArrowUp :size="13" /></button>
                  <button type="button" :class="iconButtonClass" :aria-label="`Move ${course.title} down`" :disabled="index === selected.length - 1" @click="move(index, 1)"><ArrowDown :size="13" /></button>
                  <button type="button" :class="iconButtonClass" :aria-label="`Remove ${course.title}`" @click="selected.splice(index, 1)"><X :size="13" /></button>
                </li>
              </ol>
              <p v-else class="text-xs text-white/45 light:text-slate-500">No courses yet. A published path needs at least one published course.</p>
              <AppDropdown v-model="courseToAdd" :options="addOptions" aria-label="Add a course" @change="addCourse" />
              <p class="text-[11px] text-white/40 light:text-slate-500">Unpublished courses are kept in the path but hidden from learners until they go live.</p>
            </div>

            <div class="flex justify-end gap-2.5 border-t border-white/8 pt-4 light:border-slate-200">
              <button type="button" class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/70 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700" @click="$emit('close')">Cancel</button>
              <button type="submit" class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-wait disabled:opacity-60" :disabled="loading || !form.title.trim()">
                <Loader2 v-if="loading" :size="14" class="animate-spin" /> {{ path ? 'Save Changes' : 'Create Path' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp, Loader2, X } from 'lucide-vue-next'
import type { Course } from '~/types'
import type { LearningPath, LearningPathForm, LearningPathStatus } from '~/types/learningPath'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useModalA11y } from '~/composables/useModalA11y'

const props = defineProps<{
  isOpen: boolean
  path: LearningPath | null
  // Every course an admin can add, in any status
  courses: Course[]
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [data: LearningPathForm]
}>()

const dialogRef = ref<HTMLElement | null>(null)
useModalA11y({ isOpen: computed(() => props.isOpen), dialogRef, onClose: () => emit('close') })

const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const labelClass = 'text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600'
const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600'
const iconButtonClass = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900'

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' }
]

const form = reactive({ title: '', description: '', thumbnail: '', status: 'draft' as LearningPathStatus })
const selected = ref<Course[]>([])
const courseToAdd = ref<string>('')

const addOptions = computed(() => [
  { value: '', label: 'Add a course…' },
  ...props.courses
    .filter(course => !selected.value.some(chosen => chosen.slug === course.slug))
    .map(course => ({ value: course.slug, label: course.status === 'published' ? course.title : `${course.title} (${course.status})` }))
])

watch(() => [props.isOpen, props.path] as const, ([open, path]) => {
  if (!open) return
  form.title = path?.title ?? ''
  form.description = path?.description ?? ''
  form.thumbnail = path?.thumbnail ?? ''
  form.status = path?.status ?? 'draft'
  selected.value = [...(path?.courses ?? [])]
  courseToAdd.value = ''
}, { immediate: true })

function addCourse() {
  const course = props.courses.find(candidate => candidate.slug === courseToAdd.value)
  if (course) selected.value.push(course)
  nextTick(() => {
    courseToAdd.value = ''
  })
}

function move(index: number, direction: -1 | 1) {
  const list = [...selected.value]
  const [item] = list.splice(index, 1)
  if (!item) return
  list.splice(index + direction, 0, item)
  selected.value = list
}

function submit() {
  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    thumbnail: form.thumbnail.trim(),
    status: form.status,
    courseSlugs: selected.value.map(course => course.slug)
  })
}
</script>
