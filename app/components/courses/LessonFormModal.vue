<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-[#05050c]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="$emit('close')">
        <div ref="dialogRef" class="max-h-[90dvh] w-full max-w-130 overflow-y-auto overscroll-contain rounded-[20px] border border-violet-500/25 bg-[#0f1019] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] focus:outline-none sm:p-6 light:border-violet-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="lesson-modal-title" tabindex="-1">
          <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4.5 light:border-slate-200">
            <div>
              <h2 id="lesson-modal-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ lesson ? 'Edit Lesson' : 'Add Lesson' }}</h2>
              <p v-if="sectionTitle" class="mt-0.5 text-xs text-white/45 light:text-slate-500">Section: {{ sectionTitle }}</p>
            </div>
            <button type="button" aria-label="Close" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>

          <form class="mt-5 flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="lesson-title">Lesson Title *</label>
              <input id="lesson-title" v-model="form.title" type="text" required maxlength="200" placeholder="e.g. Branching and merging" :class="inputClass">
            </div>

            <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div class="flex min-w-0 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="lesson-type">Type</label>
                <AppDropdown id="lesson-type" v-model="form.type" :options="typeOptions" />
              </div>
              <div class="flex min-w-0 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="lesson-duration">Duration (minutes)</label>
                <input id="lesson-duration" v-model.number="form.durationMinutes" type="number" min="0" max="1440" :class="inputClass">
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="lesson-url">Content URL</label>
              <input id="lesson-url" v-model="form.contentUrl" type="url" maxlength="1000" placeholder="https://cdn.example.com/lesson.mp4" :class="inputClass">
              <FileUploadButton
                v-model:busy="uploading"
                purpose="LESSON_CONTENT"
                accept="video/mp4,video/webm,application/pdf"
                label="Upload video or PDF"
                hint="MP4, WebM or PDF, up to 2 GB"
                @uploaded="form.contentUrl = $event.url"
              />
            </div>

            <label class="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/8 bg-white/3 p-3 light:border-slate-200 light:bg-slate-50">
              <input v-model="form.preview" type="checkbox" class="mt-0.5 size-4 accent-violet-600">
              <span>
                <span class="block text-[13px] font-semibold text-slate-100 light:text-slate-900">Free preview</span>
                <span class="text-xs text-white/45 light:text-slate-500">Learners who haven't enrolled can watch this lesson.</span>
              </span>
            </label>

            <div class="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4.5 py-2.25 text-[13px] font-medium text-white/70 transition-all hover:bg-white/9 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700" :disabled="loading" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.25 text-[13px] font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50" :disabled="loading || uploading || !form.title.trim()">
                <Loader2 v-if="loading" :size="16" class="animate-spin" />
                {{ lesson ? 'Save Lesson' : 'Add Lesson' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Loader2, X } from 'lucide-vue-next'
import type { Lesson, LessonFormData } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import FileUploadButton from '~/components/shared/FileUploadButton.vue'
import { useModalA11y } from '~/composables/useModalA11y'

const props = defineProps<{
  isOpen: boolean
  lesson?: Lesson | null
  sectionTitle?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: LessonFormData): void
}>()

const dialogRef = ref<HTMLElement | null>(null)
const uploading = ref(false)

useModalA11y({
  isOpen: computed(() => props.isOpen),
  dialogRef,
  onClose: () => emit('close')
})

const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600'

const typeOptions = [
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'quiz', label: 'Quiz' }
]

const form = reactive<LessonFormData>({
  title: '',
  type: 'video',
  durationMinutes: 10,
  contentUrl: '',
  preview: false
})

watch(
  () => [props.isOpen, props.lesson] as const,
  ([open, lesson]) => {
    if (!open) return
    form.title = lesson?.title ?? ''
    form.type = lesson?.type ?? 'video'
    form.durationMinutes = lesson?.durationMinutes ?? 10
    form.contentUrl = lesson?.contentUrl ?? ''
    form.preview = lesson?.preview ?? false
  },
  { immediate: true }
)

function handleSubmit() {
  emit('submit', {
    ...form,
    title: form.title.trim(),
    contentUrl: form.contentUrl.trim(),
    durationMinutes: Number(form.durationMinutes) || 0
  })
}
</script>
