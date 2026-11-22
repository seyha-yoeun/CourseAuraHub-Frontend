<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="code"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] light:bg-slate-900/40"
        @click.self="emit('close')"
      >
        <div
          ref="dialogRef"
          class="flex max-h-[90dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101814] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] focus:outline-none light:border-slate-200 light:bg-white light:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-code-title"
          tabindex="-1"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 px-6 pt-5">
            <div class="flex flex-wrap items-center gap-2">
              <h2 id="access-code-title" class="text-lg font-semibold text-slate-50 light:text-slate-900">Access code</h2>
              <span class="rounded-full px-2 py-0.5 text-[12px] font-medium" :class="statusBadge(code.status)">
                {{ ACCESS_CODE_STATUS_LABELS[code.status] ?? code.status }}
              </span>
            </div>
            <button
              type="button"
              class="-mt-1 -mr-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/45 hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-400 light:hover:bg-slate-100 light:hover:text-slate-700"
              aria-label="Close"
              @click="emit('close')"
            >
              <X :size="18" aria-hidden="true" />
            </button>
          </div>

          <div class="overflow-y-auto px-6 pt-4 pb-5">
            <!-- The code: full once revealed, otherwise its ending -->
            <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 light:border-slate-200 light:bg-slate-50">
              <p class="font-mono text-[17px] tracking-wider text-slate-50 light:text-slate-900" aria-live="polite">
                <template v-if="revealed">
                  <span class="sr-only">Full code: </span>{{ revealed }}
                </template>
                <template v-else>
                  <span class="text-white/30 light:text-slate-300" aria-hidden="true">••••-••••-••••-</span>
                  <span class="sr-only">Code ending in </span>{{ code.hint }}
                </template>
              </p>
              <div class="flex items-center gap-1">
                <button
                  v-if="code.revealable && !revealed"
                  type="button"
                  :class="inlineAction"
                  :disabled="revealing"
                  @click="reveal"
                >
                  <Loader2 v-if="revealing" :size="13" class="animate-spin" aria-hidden="true" />
                  <Eye v-else :size="13" aria-hidden="true" />
                  Show full code
                </button>
                <button v-if="revealed" type="button" :class="inlineAction" @click="revealed = null">
                  <EyeOff :size="13" aria-hidden="true" /> Hide
                </button>
                <button type="button" :class="inlineAction" @click="copy">
                  <Copy :size="13" aria-hidden="true" /> {{ revealed ? 'Copy code' : 'Copy ending' }}
                </button>
              </div>
            </div>
            <p v-if="revealError" class="mt-2 text-[12.5px] text-rose-300 light:text-negative" role="alert">{{ revealError }}</p>
            <p class="mt-2 flex items-start gap-1.5 text-[12.5px] leading-snug text-white/50 light:text-slate-500">
              <Info :size="14" class="mt-px shrink-0" aria-hidden="true" />
              <span v-if="code.revealable">Showing the full code is recorded in the audit log.</span>
              <span v-else>This code was issued before full codes were kept, so only its ending is available. If it's lost, revoke it and issue a new one.</span>
            </p>

            <!-- Details -->
            <dl class="m-0 mt-5 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-3 text-[13.5px]">
              <dt :class="term">Course</dt>
              <dd :class="value">
                <NuxtLink :to="`/courses/${code.courseSlug}`" class="font-medium text-slate-100 hover:text-brand-300 light:text-slate-900 light:hover:text-brand-600">{{ code.courseTitle }}</NuxtLink>
              </dd>

              <dt :class="term">Batch</dt>
              <dd :class="value">
                <button
                  v-if="code.batch"
                  type="button"
                  class="cursor-pointer font-mono text-[13px] text-slate-100 underline decoration-white/25 underline-offset-2 hover:text-brand-300 light:text-slate-800 light:decoration-slate-300 light:hover:text-brand-600"
                  title="Show only this batch"
                  @click="emit('filter-batch', code.batch)"
                >
                  {{ code.batch }}
                </button>
                <span v-else class="text-white/40 light:text-slate-400">None</span>
              </dd>

              <dt :class="term">Issued</dt>
              <dd :class="value">{{ formatDateTime(code.createdAt) }}</dd>

              <dt :class="term">Expires</dt>
              <dd :class="value">
                <template v-if="code.expiresAt">
                  {{ formatDateTime(code.expiresAt) }}
                  <span class="block text-[12.5px]" :class="isExpired ? 'text-rose-300 light:text-negative' : 'text-white/45 light:text-slate-500'">{{ expiryHint }}</span>
                </template>
                <span v-else>Never</span>
              </dd>

              <dt :class="term">Uses</dt>
              <dd :class="value">
                <span class="tabular-nums">{{ code.uses }} of {{ code.maxUses }} used</span>
                <span class="text-white/45 light:text-slate-500"> · {{ usesLeft }} left</span>
                <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8 light:bg-slate-100" aria-hidden="true">
                  <div class="h-full rounded-full bg-brand-400 light:bg-brand-500" :style="{ width: `${usedPercent}%` }" />
                </div>
              </dd>

              <dt :class="term">Status</dt>
              <dd :class="value">{{ STATUS_HELP[code.status] ?? '' }}</dd>
            </dl>

            <p class="mt-4 text-[12px] text-white/40 light:text-slate-500">
              Who redeemed this code isn't available here yet.
            </p>
          </div>

          <!-- Footer -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 px-6 py-3.5 light:border-slate-200">
            <template v-if="code.status === 'active'">
              <div v-if="confirmingRevoke" class="flex flex-wrap items-center gap-2" role="alert">
                <span class="text-[13px] text-white/70 light:text-slate-700">Revoke? It stops working right away.</span>
                <button type="button" :class="dangerButton" :disabled="revoking" @click="emit('revoke', code)">
                  <Loader2 v-if="revoking" :size="14" class="animate-spin" aria-hidden="true" />
                  Revoke
                </button>
                <button type="button" :class="ghostButton" :disabled="revoking" @click="confirmingRevoke = false">Keep</button>
              </div>
              <button v-else type="button" :class="[ghostButton, 'text-rose-300 hover:text-rose-200 light:text-negative light:hover:text-negative']" @click="confirmingRevoke = true">
                Revoke code
              </button>
            </template>
            <span v-else />
            <button type="button" :class="closeButton" @click="emit('close')">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Copy, Eye, EyeOff, Info, Loader2, X } from 'lucide-vue-next'
import type { AccessCode } from '~/types/gift'
import { useAppToast } from '~/composables/useAppToast'
import { ACCESS_CODE_STATUS_LABELS, useGifts } from '~/composables/useGifts'
import { getErrorMessage } from '~/utils/apiError'
import { useModalA11y } from '~/composables/useModalA11y'
import { formatDateTime } from '~/utils/dateTime'

const props = defineProps<{
  code: AccessCode | null
  revoking?: boolean
}>()

const emit = defineEmits<{
  'close': []
  'revoke': [code: AccessCode]
  'filter-batch': [batch: string]
}>()

const toast = useAppToast()
const dialogRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => Boolean(props.code))
const confirmingRevoke = ref(false)

useModalA11y({ isOpen, dialogRef, onClose: () => emit('close') })

const { revealAccessCode } = useGifts()
const revealed = ref<string | null>(null)
const revealing = ref(false)
const revealError = ref('')

// Switching or closing the dialog forgets a revealed code
watch(() => props.code?.id, () => {
  confirmingRevoke.value = false
  revealed.value = null
  revealError.value = ''
})

async function reveal() {
  if (!props.code) return
  revealing.value = true
  revealError.value = ''
  try {
    revealed.value = (await revealAccessCode(props.code.id)).code
  } catch (err) {
    revealError.value = getErrorMessage(err, 'Unable to show the full code')
  } finally {
    revealing.value = false
  }
}

const term = 'text-white/45 light:text-slate-500'
const value = 'm-0 min-w-0 text-slate-100 light:text-slate-800'
const inlineAction = 'inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold text-brand-300 hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait disabled:opacity-60 light:text-brand-600 light:hover:bg-white'
const ghostButton = 'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium text-white/70 hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:opacity-50 light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900'
const dangerButton = 'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] bg-rose-600 px-3 text-[13px] font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 disabled:cursor-wait disabled:opacity-60'
const closeButton = 'inline-flex h-9 cursor-pointer items-center rounded-[10px] border border-white/10 bg-white/5 px-4 text-[13px] font-semibold text-white/85 hover:bg-white/9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50'

const STATUS_HELP: Record<string, string> = {
  active: 'Can be redeemed now.',
  awaiting_payment: 'A gift code. It starts working once the buyer\'s payment goes through.',
  redeemed: 'Redeemed. It can\'t be used again.',
  used_up: 'Every use has been redeemed.',
  revoked: 'Turned off by an admin. Enrollments it already made are kept.',
  expired: 'Past its expiry date. It can no longer be redeemed.',
}

const usesLeft = computed(() => Math.max(0, (props.code?.maxUses ?? 0) - (props.code?.uses ?? 0)))
const usedPercent = computed(() => {
  const max = props.code?.maxUses ?? 0
  return max ? Math.min(100, Math.round(((props.code?.uses ?? 0) / max) * 100)) : 0
})

const isExpired = computed(() => Boolean(props.code?.expiresAt && new Date(props.code.expiresAt).getTime() < Date.now()))
const expiryHint = computed(() => {
  if (!props.code?.expiresAt) return ''
  const days = Math.round((new Date(props.code.expiresAt).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return `Expired ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} ago`
  if (days === 0) return 'Expires today'
  return `In ${days} ${days === 1 ? 'day' : 'days'}`
})

function statusBadge(status: string) {
  if (status === 'active') return 'bg-emerald-400/12 text-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  if (status === 'awaiting_payment') return 'bg-amber-400/12 text-amber-300 light:bg-amber-50 light:text-warning'
  if (status === 'revoked') return 'bg-rose-400/12 text-rose-300 light:bg-negative-bg light:text-negative'
  return 'bg-white/8 text-white/60 light:bg-slate-100 light:text-slate-600'
}

async function copy() {
  if (!props.code) return
  try {
    await navigator.clipboard.writeText(revealed.value ?? props.code.hint)
    toast.success(revealed.value ? 'Code copied' : 'Code ending copied')
  } catch {
    toast.error('Could not copy', 'Select the text and copy it manually.')
  }
}
</script>
