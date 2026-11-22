<template>
  <section :class="cardClass">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 :class="sectionTitle">Instructor Revenue Share</h2>
        <p class="mt-1 text-xs text-white/45 light:text-slate-500">The instructor's percentage of each sale. Only future sales use a change.</p>
      </div>
      <span v-if="share" class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="share.custom ? 'border-brand-400/30 bg-brand-400/12 text-brand-300 light:border-brand-200 light:bg-brand-50 light:text-brand-700' : 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'">
        {{ share.custom ? 'Custom' : 'Platform default' }}
      </span>
    </div>

    <div v-if="pending" class="mt-3 h-10 animate-pulse rounded-[10px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" class="mt-3 text-xs text-rose-400">{{ getErrorMessage(error, 'Unable to load the revenue share') }}</p>
    <form v-else-if="share" class="mt-3 flex flex-wrap items-end gap-2" @submit.prevent="save(Number(percent))">
      <div class="w-36">
        <label :class="labelClass" :for="inputId">Instructor %</label>
        <input :id="inputId" v-model="percent" type="number" min="0" max="100" step="0.01" required :class="inputClass">
      </div>
      <button type="submit" :class="primaryAction" :disabled="saving || percent === '' || Number(percent) === share.instructorPercent">Save</button>
      <button v-if="share.custom" type="button" :class="neutralAction" :disabled="saving" @click="save(null)">
        Use default ({{ share.platformDefaultPercent }}%)
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useAppToast } from '~/composables/useAppToast'
import { usePayouts } from '~/composables/usePayouts'
import { getErrorMessage } from '~/utils/apiError'
import { cardClass, inputClass, labelClass, neutralAction, primaryAction, sectionTitle } from '~/utils/ui'

/** Admin-only: the course's instructor share, or the platform default when it has none of its own. */
const props = defineProps<{ slug: string }>()

const toast = useAppToast()
const { fetchRevenueShare, saveRevenueShare } = usePayouts()
const inputId = `revenue-share-${useId()}`

const { data: share, pending, error } = await useAsyncData(
  () => `revenue-share-${props.slug}`,
  () => fetchRevenueShare(props.slug),
  { server: false, watch: [() => props.slug] },
)
const percent = ref<number | ''>('')
watch(share, (value) => {
  percent.value = value?.instructorPercent ?? ''
}, { immediate: true })

const saving = ref(false)

async function save(instructorPercent: number | null) {
  saving.value = true
  try {
    share.value = await saveRevenueShare(props.slug, instructorPercent)
    toast.success('Revenue Share Saved', `Instructor gets ${share.value.instructorPercent}% of new sales.`)
  } catch (err) {
    toast.error('Revenue Share Not Saved', getErrorMessage(err, 'Unable to save the revenue share'))
  } finally {
    saving.value = false
  }
}
</script>
