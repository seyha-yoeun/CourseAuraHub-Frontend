<template>
  <section v-if="items.length" :aria-label="t('Announcements')" class="rounded-[18px] border border-violet-500/20 bg-violet-500/6 p-4 light:border-violet-200 light:bg-violet-50/60">
    <h2 class="flex items-center gap-2 text-sm font-bold text-slate-100 light:text-slate-900">
      <Megaphone :size="16" class="text-violet-400" /> {{ t('Announcements') }}
    </h2>
    <ul class="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
      <li
        v-for="item in visible"
        :id="`announcement-${item.id}`"
        :key="item.id"
        class="rounded-xl border p-3.5 transition-colors"
        :class="item.id === highlightId
          ? 'border-violet-400/60 bg-violet-500/15 ring-2 ring-violet-500/30 light:border-violet-400 light:bg-white'
          : 'border-white/8 bg-white/4 light:border-slate-200 light:bg-white'"
      >
        <p class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ item.title }}</p>
        <p class="mt-0.5 text-[11px] text-white/40 light:text-slate-500">{{ item.authorName }} · {{ formatTimeAgo(item.createdAt) }}</p>
        <p class="mt-2 text-xs whitespace-pre-line text-white/70 light:text-slate-600">{{ item.body }}</p>
      </li>
    </ul>
    <button
      v-if="items.length > COLLAPSED"
      type="button"
      class="mt-2.5 cursor-pointer text-xs font-semibold text-violet-300 hover:text-violet-200 light:text-violet-700"
      @click="expanded = !expanded"
    >
      {{ expanded ? t('Show fewer') : t('Show all {count}', { count: items.length }) }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { Megaphone } from 'lucide-vue-next'
import type { Announcement } from '~/types/announcement'
import { useAnnouncements } from '~/composables/useAnnouncements'
import { formatTimeAgo } from '~/utils/dateTime'

/**
 * Staff announcements for an enrolled learner. A notification links here with ?announcement=<id>, which is
 * highlighted and scrolled into view. Renders nothing when there are none or the learner can't read them.
 */
const props = defineProps<{ slug: string, highlightId?: number | null }>()

const COLLAPSED = 2

const { t } = useT()
const { fetchForLearner } = useAnnouncements()

const items = ref<Announcement[]>([])
const expanded = ref(false)

const visible = computed(() => {
  if (expanded.value) return items.value
  const first = items.value.slice(0, COLLAPSED)
  const highlighted = items.value.find(item => item.id === props.highlightId)
  return highlighted && !first.includes(highlighted) ? [...first, highlighted] : first
})

async function load() {
  try {
    items.value = (await fetchForLearner(props.slug)).content
  } catch {
    items.value = []
  }
  if (props.highlightId) {
    await nextTick()
    document.getElementById(`announcement-${props.highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

watch(() => props.slug, load, { immediate: true })
</script>
