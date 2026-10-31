<template>
  <div class="flex flex-col gap-2.5">
    <div v-if="!curriculum.sections.length" class="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-[13px] text-white/40 light:border-slate-300 light:text-slate-500">
      {{ t('The curriculum for this course hasn\'t been published yet.') }}
    </div>

    <section
      v-for="(section, sectionIndex) in curriculum.sections"
      :key="section.id"
      class="overflow-hidden rounded-xl border border-white/8 bg-white/3 light:border-slate-200 light:bg-slate-50"
    >
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/60 light:hover:bg-slate-100"
        :aria-expanded="isOpen(section.id)"
        @click="toggle(section.id)"
      >
        <ChevronDown :size="16" class="shrink-0 text-white/40 transition-transform duration-200 light:text-slate-400" :class="isOpen(section.id) ? '' : '-rotate-90'" />
        <div class="min-w-0 flex-1">
          <span class="block truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">
            {{ sectionIndex + 1 }}. {{ section.title }}
          </span>
          <span class="text-[11px] text-white/40 light:text-slate-500">
            {{ section.lessons.length }} lessons · {{ formatDuration(section.totalDurationMinutes) }}
            <template v-if="curriculum.enrolled"> · {{ completedIn(section) }}/{{ section.lessons.length }} done</template>
          </span>
        </div>
      </button>

      <ul v-show="isOpen(section.id)" class="m-0 list-none border-t border-white/6 p-1.5 light:border-slate-200">
        <li v-for="lesson in section.lessons" :key="lesson.id">
          <div
            class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
            :class="lesson.id === activeLessonId
              ? 'bg-violet-500/15 light:bg-violet-50'
              : 'hover:bg-white/4 light:hover:bg-white'"
          >
            <button
              v-if="curriculum.enrolled"
              type="button"
              class="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:cursor-wait"
              :class="lesson.completed
                ? 'border-emerald-400 bg-emerald-400 text-zinc-950'
                : 'border-white/25 text-transparent hover:border-emerald-400/70 light:border-slate-300'"
              :aria-label="lesson.completed ? `Mark ${lesson.title} incomplete` : `Mark ${lesson.title} complete`"
              :aria-pressed="lesson.completed"
              :disabled="busyLessonId === lesson.id"
              @click="$emit('toggle-complete', lesson)"
            >
              <Check :size="12" :stroke-width="3" />
            </button>
            <component :is="typeIcon(lesson.type)" v-else :size="15" class="shrink-0 text-white/40 light:text-slate-400" />

            <button
              type="button"
              class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left disabled:cursor-default"
              :disabled="lesson.locked || !selectable"
              @click="$emit('select', lesson)"
            >
              <span
                class="truncate text-[13px]"
                :class="[
                  lesson.id === activeLessonId ? 'font-semibold text-violet-200 light:text-violet-800' : 'text-white/75 light:text-slate-700',
                  !lesson.locked && selectable ? 'hover:text-white light:hover:text-slate-900' : ''
                ]"
              >
                {{ lesson.title }}
              </span>
              <span v-if="lesson.preview && !curriculum.enrolled" class="shrink-0 rounded border border-blue-400/30 bg-blue-400/12 px-1.5 py-px text-[10px] font-semibold text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-700">
                {{ t('Preview') }}
              </span>
            </button>

            <span class="flex shrink-0 items-center gap-1.5 text-[11px] text-white/40 light:text-slate-500">
              <Lock v-if="lesson.locked" :size="12" :aria-label="t('Locked')" />
              {{ formatDuration(lesson.durationMinutes) }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown, FileText, HelpCircle, Lock, PlayCircle } from 'lucide-vue-next'
import type { CourseSection, Curriculum, LessonType } from '~/types'
import { formatDuration } from '~/composables/useCurriculum'

const { t } = useT()

const props = withDefaults(
  defineProps<{
    curriculum: Curriculum
    activeLessonId?: number | null
    busyLessonId?: number | null
    selectable?: boolean
  }>(),
  {
    activeLessonId: null,
    busyLessonId: null,
    selectable: true
  }
)

defineEmits<{
  select: [lesson: CourseSection['lessons'][number]]
  'toggle-complete': [lesson: CourseSection['lessons'][number]]
}>()

// Sections start expanded; the active lesson's section is always kept open
const collapsed = ref(new Set<number>())

function isOpen(sectionId: number) {
  return !collapsed.value.has(sectionId)
}

function toggle(sectionId: number) {
  const next = new Set(collapsed.value)
  if (next.has(sectionId)) next.delete(sectionId)
  else next.add(sectionId)
  collapsed.value = next
}

watch(() => props.activeLessonId, (lessonId) => {
  const section = props.curriculum.sections.find(s => s.lessons.some(l => l.id === lessonId))
  if (section && collapsed.value.has(section.id)) toggle(section.id)
})

function completedIn(section: CourseSection) {
  return section.lessons.filter(l => l.completed).length
}

function typeIcon(type: LessonType) {
  if (type === 'article') return FileText
  if (type === 'quiz') return HelpCircle
  return PlayCircle
}
</script>
