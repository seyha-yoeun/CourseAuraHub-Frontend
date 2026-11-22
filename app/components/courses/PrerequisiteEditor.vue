<template>
  <section class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Prerequisites') }}</h2>
        <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ t('Courses learners should finish first. Required ones block enrolling until they are completed. Up to 10.') }}</p>
      </div>
      <button type="button" :class="primaryAction" :disabled="saving || !dirty" @click="save">
        {{ saving ? t('Saving...') : t('Save') }}
      </button>
    </div>

    <ul v-if="items.length" class="m-0 mt-4 flex list-none flex-col gap-2 p-0">
      <li v-for="(item, index) in items" :key="item.courseSlug" class="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2 light:border-slate-200 light:bg-slate-50">
        <span class="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ titleOf(item.courseSlug) }}</span>
        <label class="inline-flex items-center gap-2 text-xs text-white/70 light:text-slate-600">
          <input v-model="item.hard" type="checkbox" class="size-4 accent-brand-600" @change="dirty = true">
          {{ t('Required') }}
        </label>
        <button type="button" :class="dangerAction" @click="removeAt(index)">{{ t('Remove') }}</button>
      </li>
    </ul>
    <p v-else class="mt-3 text-xs text-white/45 light:text-slate-500">{{ t('No prerequisites.') }}</p>

    <form v-if="items.length < 10" class="mt-3 flex flex-wrap items-center gap-2" @submit.prevent="add">
      <div class="w-full sm:w-72">
        <AppDropdown v-model="adding" :options="availableOptions" :placeholder="t('Add a course')" size="sm" :aria-label="t('Course to add')" />
      </div>
      <button type="submit" :class="neutralAction" :disabled="!adding">{{ t('Add') }}</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { PrerequisiteInput } from '~/types/prerequisite'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useCourseOptions } from '~/composables/useCourseOptions'
import { usePrerequisites } from '~/composables/usePrerequisites'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()

/** Edits a course's prerequisites as one list, saved together. */
const props = defineProps<{ slug: string }>()

const toast = useAppToast()
const { fetchRequirements, savePrerequisites } = usePrerequisites()
const { courses, courseOptions } = await useCourseOptions()

const items = ref<PrerequisiteInput[]>([])
const titles = ref<Record<string, string>>({})
const adding = ref('')
const dirty = ref(false)
const saving = ref(false)

const availableOptions = computed(() => courseOptions.value.filter(option =>
  option.value !== props.slug && !items.value.some(item => item.courseSlug === option.value)))

function titleOf(slug: string) {
  return titles.value[slug] ?? courses.value.find(course => course.slug === slug)?.title ?? slug
}

async function load() {
  try {
    const requirements = await fetchRequirements(props.slug)
    items.value = requirements.prerequisites.map(item => ({ courseSlug: item.courseSlug, hard: item.hard }))
    titles.value = Object.fromEntries(requirements.prerequisites.map(item => [item.courseSlug, item.courseTitle]))
    dirty.value = false
  } catch {
    items.value = []
  }
}

function add() {
  if (!adding.value) return
  items.value.push({ courseSlug: adding.value, hard: false })
  adding.value = ''
  dirty.value = true
}

function removeAt(index: number) {
  items.value.splice(index, 1)
  dirty.value = true
}

async function save() {
  saving.value = true
  try {
    const saved = await savePrerequisites(props.slug, items.value)
    items.value = saved.map(item => ({ courseSlug: item.courseSlug, hard: item.hard }))
    titles.value = Object.fromEntries(saved.map(item => [item.courseSlug, item.courseTitle]))
    dirty.value = false
    toast.success(t('Prerequisites Saved'))
  } catch (err) {
    toast.error(t('Prerequisites Not Saved'), getErrorMessage(err, t('Unable to save prerequisites')))
  } finally {
    saving.value = false
  }
}

const actionBase = 'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
const primaryAction = `${actionBase} border-brand-500/35 bg-brand-500/15 text-brand-300 hover:bg-brand-500/25 light:border-brand-200 light:bg-brand-50 light:text-brand-700`
const neutralAction = `${actionBase} border-white/10 bg-white/5 text-white/75 hover:bg-white/9 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700`
const dangerAction = `${actionBase} border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 light:border-rose-200 light:bg-rose-50 light:text-rose-600`

watch(() => props.slug, load, { immediate: true })
</script>
