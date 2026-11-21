<template>
  <section v-if="visible.length" :aria-label="t('Live sessions')" class="rounded-[18px] border border-rose-500/20 bg-rose-500/6 p-4 light:border-rose-200 light:bg-rose-50/60">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="flex items-center gap-2 text-sm font-bold text-slate-100 light:text-slate-900">
        <Video :size="16" class="text-rose-400" /> {{ t('Live sessions') }}
      </h2>
      <NuxtLink to="/live-sessions" class="text-xs font-semibold text-brand-300 no-underline light:text-brand-700">{{ t('All live sessions') }}</NuxtLink>
    </div>
    <LiveSessionList class="mt-3" :sessions="visible" :highlight-id="highlightId" @joined="load" />
  </section>
</template>

<script setup lang="ts">
import { Video } from 'lucide-vue-next'
import type { LearnerLiveSession } from '~/types/live'
import LiveSessionList from '~/components/learning/LiveSessionList.vue'
import { sortSessions, useLiveSessions } from '~/composables/useLiveSessions'

/**
 * This course's live sessions for an enrolled learner. Notifications and calendar events link here with
 * ?live=<id>, which is shown even when it already ended, highlighted and scrolled into view.
 */
const props = defineProps<{ slug: string, highlightId?: number | null }>()

const { t } = useT()
const { fetchMine } = useLiveSessions()
const sessions = ref<LearnerLiveSession[]>([])

const visible = computed(() => {
  const { upcoming, past } = sortSessions(sessions.value.filter(s => s.courseSlug === props.slug))
  const highlighted = past.find(s => s.id === props.highlightId)
  return highlighted ? [...upcoming, highlighted] : upcoming
})

async function load() {
  try {
    sessions.value = await fetchMine()
  } catch {
    sessions.value = []
  }
  if (props.highlightId) {
    await nextTick()
    document.getElementById(`live-${props.highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

watch(() => props.slug, load, { immediate: true })
</script>
