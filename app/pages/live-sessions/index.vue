<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 :class="pageTitle">{{ t('Live sessions') }}</h1>
        <p :class="pageSubtitle">{{ t('Live classes in your courses. Join from here when they start.') }}</p>
      </div>
      <button type="button" :class="primaryButton" :disabled="creatingFeed" @click="createFeed">
        <Loader2 v-if="creatingFeed" :size="15" class="animate-spin" />
        <CalendarPlus v-else :size="15" />
        {{ feedUrl ? t('New calendar link') : t('Add to my calendar') }}
      </button>
    </div>

    <section v-if="feedUrl" :class="cardClass">
      <h2 :class="sectionTitle">{{ t('Your calendar link') }}</h2>
      <p class="mt-1 text-xs text-white/50 light:text-slate-500">{{ t('Subscribe to it in Google Calendar, Outlook or Apple Calendar. Keep it private: anyone with it can see your schedule. Making a new link stops the old one.') }}</p>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <input :value="feedUrl" type="text" readonly :aria-label="t('Your calendar link')" class="min-w-0 flex-1 font-mono" :class="inputClass" @focus="($event.target as HTMLInputElement).select()">
        <button type="button" :class="primaryAction" @click="copyFeed">
          <span class="inline-flex items-center gap-1.5"><Copy :size="13" /> {{ t('Copy') }}</span>
        </button>
      </div>
    </section>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load live sessions')) }}</p>
    <div v-else-if="!sessions.length" :class="emptyBox">
      <Video :size="30" class="mx-auto mb-2 text-white/30 light:text-slate-400" />
      {{ t('No live sessions are scheduled in your courses.') }}
    </div>

    <template v-else>
      <section v-if="grouped.upcoming.length" class="flex flex-col gap-3">
        <h2 :class="sectionTitle">{{ t('Coming up') }}</h2>
        <LiveSessionList :sessions="grouped.upcoming" show-course @joined="refresh" />
      </section>
      <section v-if="grouped.past.length" class="flex flex-col gap-3">
        <h2 :class="sectionTitle">{{ t('Last week') }}</h2>
        <LiveSessionList :sessions="grouped.past" show-course />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { CalendarPlus, Copy, Loader2, Video } from 'lucide-vue-next'
import LiveSessionList from '~/components/learning/LiveSessionList.vue'
import { useAppToast } from '~/composables/useAppToast'
import { sortSessions, useLiveSessions } from '~/composables/useLiveSessions'
import { getErrorMessage } from '~/utils/apiError'
import { cardClass, emptyBox, inputClass, pageSubtitle, pageTitle, primaryAction, primaryButton, sectionTitle } from '~/utils/ui'

const { t } = useT()
useHead({ title: () => t('Live sessions') })

const toast = useAppToast()
const { fetchMine, createCalendarFeed } = useLiveSessions()

const { data, pending, error, refresh } = await useAsyncData('my-live-sessions', fetchMine, { server: false })
const sessions = computed(() => data.value ?? [])
const grouped = computed(() => sortSessions(sessions.value))

const feedUrl = ref('')
const creatingFeed = ref(false)

async function createFeed() {
  creatingFeed.value = true
  try {
    feedUrl.value = (await createCalendarFeed()).feedUrl
  } catch (err) {
    toast.error(t('Calendar link not created'), getErrorMessage(err, t('Please try again.')))
  } finally {
    creatingFeed.value = false
  }
}

async function copyFeed() {
  try {
    await navigator.clipboard.writeText(feedUrl.value)
    toast.success(t('Link copied'))
  } catch {
    toast.info(t('Select the link and copy it'))
  }
}
</script>
