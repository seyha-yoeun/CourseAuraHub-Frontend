<template>
  <span class="inline-flex flex-wrap items-center gap-2">
    <button
      v-for="item in exportsList"
      :key="item.name"
      type="button"
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
      :disabled="busy === item.name"
      :title="item.title"
      @click="download(item.name)"
    >
      <Loader2 v-if="busy === item.name" :size="13" class="animate-spin" />
      <Download v-else :size="13" />
      {{ item.label }}
    </button>
  </span>
</template>

<script setup lang="ts">
import { Download, Loader2 } from 'lucide-vue-next'
import { type CourseExport, useExports } from '~/composables/useExports'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'

/** CSV downloads of one course's learners and grades, for its instructor and admins. */
const props = defineProps<{ slug: string }>()

const toast = useAppToast()
const { downloadCourseExport } = useExports()
const busy = ref<CourseExport | null>(null)

const exportsList: { name: CourseExport, label: string, title: string }[] = [
  { name: 'learners', label: 'Learners CSV', title: 'Learners with their progress' },
  { name: 'grades', label: 'Grades CSV', title: 'Quiz scores and assignment grades' },
]

async function download(name: CourseExport) {
  busy.value = name
  try {
    await downloadCourseExport(props.slug, name)
  } catch (err) {
    toast.error('Export Failed', getErrorMessage(err, 'Unable to download the export'))
  } finally {
    busy.value = null
  }
}
</script>
