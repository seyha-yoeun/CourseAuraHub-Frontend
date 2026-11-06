<template>
  <span class="inline-flex">
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-semibold text-white/40 transition-colors hover:bg-white/5 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:text-slate-400 light:hover:bg-slate-100 light:hover:text-rose-600"
      :title="t('Report')"
      :aria-label="t('Report this {type}', { type: t(targetType) })"
      @click="open = true"
    >
      <Flag :size="12" />
      <span v-if="showLabel">{{ t('Report') }}</span>
    </button>

    <PromptModal
      :is-open="open"
      :title="t('Report this {type}', { type: t(targetType) })"
      :description="t('An admin will review it. Reports are anonymous to the author.')"
      :label="t('What is wrong with it?')"
      :placeholder="t('Spam, abuse, off-topic...')"
      :confirm-label="t('Send report')"
      tone="danger"
      required
      :maxlength="500"
      :loading="sending"
      @close="open = false"
      @confirm="send"
    />
  </span>
</template>

<script setup lang="ts">
import { Flag } from 'lucide-vue-next'
import type { ReportTargetType } from '~/types/moderation'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useModeration } from '~/composables/useModeration'
import { getErrorMessage } from '~/utils/apiError'

const props = defineProps<{
  targetType: ReportTargetType
  targetId: number
  showLabel?: boolean
}>()

const { t } = useT()
const toast = useAppToast()
const { reportContent } = useModeration()

const open = ref(false)
const sending = ref(false)

async function send(reason: string) {
  sending.value = true
  try {
    await reportContent(props.targetType, props.targetId, reason)
    toast.success(t('Report sent'), t('Thanks, an admin will take a look.'))
    open.value = false
  } catch (err) {
    toast.error(t('Report not sent'), getErrorMessage(err, t('Unable to send the report')))
  } finally {
    sending.value = false
  }
}
</script>
