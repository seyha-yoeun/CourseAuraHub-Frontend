<template>
  <section :class="cardClass">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 :class="sectionTitle">{{ t('Live Sessions') }}</h2>
        <p class="mt-1 text-xs text-white/45 light:text-slate-500">{{ t('Enrolled learners are notified, then reminded an hour and ten minutes before.') }}</p>
      </div>
      <button type="button" :class="primaryAction" @click="openForm(null)">
        <span class="inline-flex items-center gap-1.5"><Plus :size="14" /> {{ t('Schedule') }}</span>
      </button>
    </div>

    <div v-if="pending" class="mt-3 h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" class="mt-3 text-xs text-rose-400">{{ getErrorMessage(error, t('Unable to load live sessions')) }}</p>
    <p v-else-if="!sessions.length" class="mt-3 text-xs text-white/45 light:text-slate-500">{{ t('No live sessions yet.') }}</p>

    <template v-else>
      <ul class="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        <li v-for="session in visible" :key="session.id" class="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-white/8 bg-white/3 px-3.5 py-2.5 light:border-slate-200 light:bg-slate-50" :class="session.cancelled ? 'opacity-60' : ''">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-semibold text-slate-100 light:text-slate-900" :class="session.cancelled ? 'line-through' : ''">{{ session.title }}</p>
            <p class="text-xs text-white/50 light:text-slate-500">
              {{ t('{startsAt} · {durationMinutes} min', { startsAt: formatDateTime(session.startsAt), durationMinutes: session.durationMinutes }) }}
              <template v-if="isPast(session)"> {{ t('· {attendees} joined', { attendees: session.attendees }) }}</template>
            </p>
          </div>
          <span v-if="session.cancelled" class="text-[11px] font-semibold text-rose-400">{{ t('Cancelled') }}</span>
          <template v-else-if="!isPast(session)">
            <a :href="session.meetingUrl" target="_blank" rel="noopener noreferrer" :class="neutralAction" class="no-underline">{{ t('Open meeting') }}</a>
            <button type="button" :class="primaryAction" @click="openForm(session)">{{ t('Edit') }}</button>
            <button type="button" :class="dangerAction" @click="cancelling = session">{{ t('Cancel') }}</button>
          </template>
          <button v-else type="button" :class="neutralAction" @click="openForm(session)">{{ t('Link recording') }}</button>
        </li>
      </ul>
      <button v-if="past.length && !showPast" type="button" class="mt-2 cursor-pointer text-xs font-semibold text-brand-300 hover:text-brand-200 light:text-brand-700" @click="showPast = true">
        {{ past.length === 1 ? t('Show 1 past session') : t('Show {count} past sessions', { count: past.length }) }}
      </button>
    </template>

    <PromptModal
      :is-open="isFormOpen"
      :title="editing ? t('Edit Live Session') : t('Schedule Live Session')"
      :description="editing && !isPast(editing) ? t('Moving it tells learners and resets their reminders.') : undefined"
      :show-input="false"
      :confirm-label="editing ? t('Save') : t('Schedule')"
      :loading="saving"
      :disabled="!canSave"
      @close="isFormOpen = false"
      @confirm="save"
    >
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label :class="labelClass" :for="`${uid}-title`">{{ t('Title') }}</label>
          <input :id="`${uid}-title`" v-model="form.title" type="text" maxlength="200" required :class="inputClass">
        </div>
        <div class="sm:col-span-2">
          <label :class="labelClass" :for="`${uid}-description`">{{ t('Description') }}</label>
          <textarea :id="`${uid}-description`" v-model="form.description" rows="2" maxlength="2000" :class="inputClass" />
        </div>
        <div>
          <label :class="labelClass" :for="`${uid}-starts`">{{ t('Starts') }}</label>
          <input :id="`${uid}-starts`" v-model="form.startsAt" type="datetime-local" required :class="inputClass">
        </div>
        <div>
          <label :class="labelClass" :for="`${uid}-duration`">{{ t('Duration (minutes)') }}</label>
          <input :id="`${uid}-duration`" v-model.number="form.durationMinutes" type="number" min="5" max="600" required :class="inputClass">
        </div>
        <div class="sm:col-span-2">
          <label :class="labelClass" :for="`${uid}-url`">{{ t('Meeting link') }}</label>
          <input :id="`${uid}-url`" v-model="form.meetingUrl" type="url" maxlength="1000" required placeholder="https://meet.example.com/..." :class="inputClass">
          <p class="mt-1 text-[11px] text-white/40 light:text-slate-500">{{ t('Only https links. Learners get it when they join, never from a listing.') }}</p>
        </div>
        <div class="sm:col-span-2">
          <span :class="labelClass">{{ t('Recording lesson (optional)') }}</span>
          <AppDropdown
            :model-value="form.recordingLessonId ?? NONE"
            :options="lessonOptions"
            :aria-label="t('Lesson holding the recording')"
            @update:model-value="value => form.recordingLessonId = value === NONE ? null : Number(value)"
          />
        </div>
      </div>
    </PromptModal>

    <ConfirmDeleteModal
      :is-open="Boolean(cancelling)"
      :title="t('Cancel Live Session')"
      :description="t('Enrolled learners are told it\'s cancelled. Attendance is kept.')"
      :item-name="cancelling?.title"
      :loading="saving"
      @close="cancelling = null"
      @confirm="confirmCancel"
    />
  </section>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { LiveSessionForm, ManagedLiveSession } from '~/types/live'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useCurriculum } from '~/composables/useCurriculum'
import { sortSessions, useLiveSessions } from '~/composables/useLiveSessions'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime, fromLocalInput, toLocalInput } from '~/utils/dateTime'
import { cardClass, dangerAction, inputClass, labelClass, neutralAction, primaryAction, sectionTitle } from '~/utils/ui'

const { t } = useT()

/** Course staff schedule live classes; shown on the instructor and admin course pages. */
const props = defineProps<{ slug: string }>()

const toast = useAppToast()
const uid = `live-${useId()}`
const { fetchForCourse, schedule, update, cancelSession } = useLiveSessions()
const { fetchCurriculum } = useCurriculum()

const { data, pending, error, refresh } = await useAsyncData(
  () => `live-sessions-${props.slug}`,
  () => fetchForCourse(props.slug),
  { server: false, watch: [() => props.slug] },
)
const sessions = computed(() => data.value ?? [])
const grouped = computed(() => sortSessions(sessions.value))
const past = computed(() => grouped.value.past)
const showPast = ref(false)
const visible = computed(() => showPast.value ? [...grouped.value.upcoming, ...past.value] : grouped.value.upcoming)

// Lessons a recording can point to; a failure just leaves "None"
const NONE = 'none'
const { data: curriculum } = await useAsyncData(
  () => `live-lessons-${props.slug}`,
  () => fetchCurriculum(props.slug).catch(() => null),
  { server: false, watch: [() => props.slug] },
)
const lessonOptions = computed(() => [
  { value: NONE, label: t('None') },
  ...(curriculum.value?.sections ?? []).flatMap(section => section.lessons.map(lesson => ({ value: lesson.id, label: `${section.title} · ${lesson.title}` }))),
])

function isPast(session: ManagedLiveSession) {
  return new Date(session.endsAt).getTime() < Date.now()
}

const isFormOpen = ref(false)
const editing = ref<ManagedLiveSession | null>(null)
const saving = ref(false)
const cancelling = ref<ManagedLiveSession | null>(null)
const form = reactive({ title: '', description: '', startsAt: '', durationMinutes: 60, meetingUrl: '', recordingLessonId: null as number | null })

const canSave = computed(() => Boolean(form.title.trim() && form.startsAt && form.meetingUrl.trim().startsWith('https://')
  && form.durationMinutes >= 5 && form.durationMinutes <= 600))

function openForm(session: ManagedLiveSession | null) {
  editing.value = session
  Object.assign(form, session
    ? {
        title: session.title,
        description: session.description ?? '',
        startsAt: toLocalInput(session.startsAt),
        durationMinutes: session.durationMinutes,
        meetingUrl: session.meetingUrl,
        recordingLessonId: session.recordingLessonId,
      }
    : { title: '', description: '', startsAt: '', durationMinutes: 60, meetingUrl: '', recordingLessonId: null })
  isFormOpen.value = true
}

async function save() {
  const body: LiveSessionForm = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    startsAt: fromLocalInput(form.startsAt) ?? '',
    durationMinutes: Number(form.durationMinutes),
    meetingUrl: form.meetingUrl.trim(),
    recordingLessonId: form.recordingLessonId,
  }
  saving.value = true
  try {
    if (editing.value) {
      await update(props.slug, editing.value.id, body)
      toast.success(t('Live Session Saved'), body.title)
    } else {
      await schedule(props.slug, body)
      toast.success(t('Live Session Scheduled'), t('Enrolled learners have been notified.'))
    }
    isFormOpen.value = false
    await refresh()
  } catch (err) {
    toast.error(t('Live Session Not Saved'), getErrorMessage(err, t('Unable to save the live session')))
  } finally {
    saving.value = false
  }
}

async function confirmCancel() {
  const session = cancelling.value
  if (!session) return
  saving.value = true
  try {
    await cancelSession(props.slug, session.id)
    cancelling.value = null
    toast.info(t('Live Session Cancelled'), session.title)
    await refresh()
  } catch (err) {
    toast.error(t('Live Session Not Cancelled'), getErrorMessage(err, t('Unable to cancel the live session')))
  } finally {
    saving.value = false
  }
}
</script>
