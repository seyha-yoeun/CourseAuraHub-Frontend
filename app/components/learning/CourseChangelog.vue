<template>
  <section v-if="entries.length" class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <h3 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('What\'s new') }}</h3>
    <ol class="m-0 mt-3 flex list-none flex-col gap-3 border-l border-white/10 p-0 pl-4 light:border-slate-200">
      <li v-for="entry in visible" :key="entry.date" class="relative">
        <span class="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-violet-400 bg-zinc-950 light:bg-white" />
        <p class="text-xs font-semibold text-white/50 light:text-slate-500">{{ formatDate(entry.date) }}</p>
        <p class="mt-0.5 text-[13px] text-white/75 light:text-slate-700">{{ entry.summary || t('Updated {fields}', { fields: entry.fields.map(field => t(field)).join(', ') }) }}</p>
      </li>
    </ol>
    <button v-if="entries.length > visible.length" type="button" class="mt-3 cursor-pointer text-xs font-semibold text-violet-300 light:text-violet-700" @click="showAll = true">
      {{ t('Show all updates') }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { useRevisions } from '~/composables/useRevisions'
import { formatDate } from '~/utils/dateTime'

/** Approved changes to the course, newest first. Hidden when there are none. */
const props = defineProps<{ slug: string }>()

const { t } = useT()
const { fetchChangelog } = useRevisions()

const { data } = useAsyncData(
  () => `changelog-${props.slug}`,
  () => fetchChangelog(props.slug).catch(() => []),
  { server: false, watch: [() => props.slug] },
)
const entries = computed(() => data.value ?? [])
const showAll = ref(false)
const visible = computed(() => showAll.value ? entries.value : entries.value.slice(0, 3))
</script>
