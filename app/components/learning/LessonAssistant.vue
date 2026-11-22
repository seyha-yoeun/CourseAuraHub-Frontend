<template>
  <div class="mt-4 flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-xs text-white/50 light:text-slate-500">{{ t('Ask about this lesson. Answers come from the lesson\'s own material.') }}</p>
      <span v-if="usage" class="text-[11px] text-white/40 light:text-slate-500">{{ t('{count} tokens left today', { count: usage.tokensLeft.toLocaleString() }) }}</span>
    </div>

    <!-- Summary -->
    <div class="rounded-xl border border-brand-500/20 bg-brand-500/6 p-3 light:border-brand-200 light:bg-brand-50/60">
      <button v-if="!summary && !summarizing" type="button" class="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand-300 light:text-brand-700" @click="summarize">
        <Sparkles :size="14" /> {{ t('Summarize this lesson') }}
      </button>
      <p v-else-if="summarizing" class="flex items-center gap-2 text-xs text-white/55 light:text-slate-500"><Loader2 :size="14" class="animate-spin" /> {{ t('Summarizing...') }}</p>
      <div v-else>
        <p class="flex items-center gap-1.5 text-xs font-semibold text-brand-300 light:text-brand-700"><Sparkles :size="14" /> {{ t('Summary') }}</p>
        <p class="mt-1.5 text-[13px] leading-relaxed whitespace-pre-line text-slate-100 light:text-slate-800">{{ summary }}</p>
      </div>
    </div>

    <!-- Conversation -->
    <div v-if="thread.length" ref="threadRef" class="flex max-h-[28rem] flex-col gap-2.5 overflow-y-auto pr-1">
      <div
        v-for="(item, index) in thread"
        :key="index"
        class="max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line"
        :class="item.role === 'user'
          ? 'self-end bg-brand-500 text-white'
          : 'self-start border border-white/8 bg-white/4 text-slate-100 light:border-slate-200 light:bg-slate-50 light:text-slate-800'"
      >
        <template v-if="item.content">{{ item.content }}</template>
        <span v-else class="inline-flex items-center gap-1.5 text-white/50 light:text-slate-500"><Loader2 :size="13" class="animate-spin" /> {{ t('Thinking...') }}</span>
      </div>
    </div>
    <p v-else-if="loadingHistory" class="text-xs text-white/45 light:text-slate-500">{{ t('Loading...') }}</p>

    <form class="flex flex-col gap-2" @submit.prevent="send">
      <textarea
        v-model="draft"
        rows="2"
        maxlength="4000"
        :placeholder="t('Ask a question about this lesson')"
        :aria-label="t('Ask a question about this lesson')"
        class="w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400"
        @keydown.enter.exact.prevent="send"
      />
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button v-if="conversationId && !streaming" type="button" class="cursor-pointer text-xs font-semibold text-white/55 hover:text-white light:text-slate-500 light:hover:text-slate-900" @click="startOver">{{ t('New conversation') }}</button>
        <button v-if="streaming" type="button" class="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/75 light:border-slate-200 light:bg-slate-100 light:text-slate-700" @click="stop">{{ t('Stop') }}</button>
        <button v-else type="submit" class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-500/40 bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" :disabled="!draft.trim()">
          <Send :size="13" /> {{ t('Ask') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Send, Sparkles } from 'lucide-vue-next'
import type { AssistantUsage } from '~/types/assistant'
import { useAppToast } from '~/composables/useAppToast'
import { useAssistant } from '~/composables/useAssistant'
import { getErrorMessage } from '~/utils/apiError'

/** The AI study assistant for one lesson: a summary on request and a chat that continues the latest conversation. */
const props = defineProps<{ lessonId: number }>()

const { t } = useT()
const toast = useAppToast()
const { fetchConversations, fetchUsage, fetchSummary, ask } = useAssistant()

const thread = ref<{ role: 'user' | 'assistant', content: string }[]>([])
const conversationId = ref<number | null>(null)
const usage = ref<AssistantUsage | null>(null)
const summary = ref('')
const summarizing = ref(false)
const loadingHistory = ref(true)
const draft = ref('')
const streaming = ref(false)
const threadRef = ref<HTMLElement | null>(null)
let controller: AbortController | null = null

async function scrollDown() {
  await nextTick()
  threadRef.value?.scrollTo({ top: threadRef.value.scrollHeight })
}

onMounted(async () => {
  const [conversations, allowance] = await Promise.all([
    fetchConversations(props.lessonId).catch(() => []),
    fetchUsage().catch(() => null),
  ])
  usage.value = allowance
  // Pick up where the learner left off: the newest conversation
  const latest = conversations[0]
  if (latest) {
    conversationId.value = latest.id
    thread.value = latest.messages.map(message => ({ role: message.role, content: message.content }))
  }
  loadingHistory.value = false
  scrollDown()
})

onBeforeUnmount(() => controller?.abort())

async function summarize() {
  summarizing.value = true
  try {
    summary.value = (await fetchSummary(props.lessonId)).summary
  } catch (err) {
    toast.error(t('No summary'), getErrorMessage(err, t('Unable to summarize this lesson')))
  } finally {
    summarizing.value = false
  }
}

async function send() {
  const message = draft.value.trim()
  if (!message || streaming.value) return
  draft.value = ''
  thread.value.push({ role: 'user', content: message })
  const answer = reactive({ role: 'assistant' as const, content: '' })
  thread.value.push(answer)
  streaming.value = true
  controller = new AbortController()
  scrollDown()
  try {
    const result = await ask(props.lessonId, message, conversationId.value, {
      onConversation: (id) => {
        conversationId.value = id
      },
      onDelta: (text) => {
        answer.content += text
        scrollDown()
      },
    }, controller.signal)
    if (result.refused && !answer.content) answer.content = t('I can only help with questions about this lesson.')
  } catch (err) {
    // The question and its answer are the last two entries
    if (controller?.signal.aborted) {
      if (!answer.content) thread.value.pop()
    } else {
      thread.value.splice(-2, 2)
      draft.value = message
      toast.error(t('No answer'), err instanceof Error ? err.message : t('Please try again.'))
    }
  } finally {
    streaming.value = false
    controller = null
    usage.value = await fetchUsage().catch(() => usage.value)
  }
}

function stop() {
  controller?.abort()
}

function startOver() {
  conversationId.value = null
  thread.value = []
}
</script>
