<template>
  <ul class="m-0 flex list-none flex-col gap-2.5 p-0">
    <li
      v-for="session in sessions"
      :id="`live-${session.id}`"
      :key="session.id"
      class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border p-3.5 transition-colors"
      :class="session.id === highlightId
        ? 'border-rose-400/60 bg-rose-500/12 ring-2 ring-rose-500/25 light:border-rose-300 light:bg-white'
        : 'border-white/8 bg-white/4 light:border-slate-200 light:bg-white'"
    >
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-2 text-[13px] font-semibold text-slate-100 light:text-slate-900">
          <span v-if="isLive(session)" class="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
            <span class="size-1.5 animate-pulse rounded-full bg-white" /> {{ t('Live') }}
          </span>
          <span :class="session.cancelled ? 'line-through opacity-60' : ''">{{ session.title }}</span>
        </p>
        <p class="mt-0.5 text-xs text-white/50 light:text-slate-500">
          <NuxtLink v-if="showCourse" :to="`/learn/${session.courseSlug}?live=${session.id}`" class="font-semibold text-violet-300 no-underline light:text-violet-700">{{ session.courseTitle }}</NuxtLink>
          <template v-if="showCourse"> · </template>
          {{ formatDateTime(session.startsAt) }} – {{ formatTime(session.endsAt) }}
        </p>
        <p v-if="session.description" class="mt-1.5 text-xs whitespace-pre-line text-white/65 light:text-slate-600">{{ session.description }}</p>
      </div>

      <span v-if="session.cancelled" class="text-xs font-semibold text-rose-400">{{ t('Session cancelled') }}</span>
      <button
        v-else-if="session.joinable"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-rose-500/40 bg-linear-to-br from-rose-600 to-rose-700 px-4 py-2 text-xs font-semibold text-white transition-all hover:from-rose-500 hover:to-rose-600 disabled:cursor-wait disabled:opacity-60"
        :disabled="joiningId === session.id"
        @click="joinSession(session)"
      >
        <Loader2 v-if="joiningId === session.id" :size="14" class="animate-spin" />
        <Video v-else :size="14" />
        {{ t('Join now') }}
      </button>
      <NuxtLink
        v-else-if="isOver(session) && session.recordingLessonId"
        :to="{ path: `/learn/${session.courseSlug}`, query: { lesson: String(session.recordingLessonId) } }"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 no-underline light:text-violet-700"
      >
        <PlayCircle :size="14" /> {{ t('Watch the recording') }}
      </NuxtLink>
      <span v-else-if="isOver(session)" class="text-xs text-white/45 light:text-slate-500">
        {{ session.attended ? t('You joined') : t('Session ended') }}
      </span>
      <span v-else class="text-xs font-semibold text-white/60 light:text-slate-600">{{ startsIn(session.startsAt) }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Loader2, PlayCircle, Video } from 'lucide-vue-next'
import type { LearnerLiveSession } from '~/types/live'
import { useAppToast } from '~/composables/useAppToast'
import { useLiveSessions } from '~/composables/useLiveSessions'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'

/** Live sessions with a Join button. Joining records attendance and opens the meeting in a new tab. */
defineProps<{ sessions: LearnerLiveSession[], highlightId?: number | null, showCourse?: boolean }>()
const emit = defineEmits<{ joined: [id: number] }>()

const { t } = useT()
const toast = useAppToast()
const { join } = useLiveSessions()
const joiningId = ref<number | null>(null)

function isOver(session: LearnerLiveSession) {
  return new Date(session.endsAt).getTime() < Date.now()
}

function isLive(session: LearnerLiveSession) {
  const now = Date.now()
  return !session.cancelled && new Date(session.startsAt).getTime() <= now && !isOver(session)
}

function startsIn(value: string) {
  const minutes = Math.max(1, Math.round((new Date(value).getTime() - Date.now()) / 60000))
  if (minutes < 60) return t('Starts in {count} min', { count: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return t('Starts in {count} h', { count: hours })
  return t('Starts in {count} days', { count: Math.round(hours / 24) })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

async function joinSession(session: LearnerLiveSession) {
  // Opened before the request so the browser doesn't treat it as an unrequested pop-up
  const tab = window.open('', '_blank')
  joiningId.value = session.id
  try {
    const { meetingUrl } = await join(session.id)
    if (tab) {
      tab.opener = null
      tab.location.href = meetingUrl
    } else {
      window.location.href = meetingUrl
    }
    emit('joined', session.id)
  } catch (err) {
    tab?.close()
    toast.error(t('Unable to join'), getErrorMessage(err, t('Unable to join the live session')))
  } finally {
    joiningId.value = null
  }
}
</script>
