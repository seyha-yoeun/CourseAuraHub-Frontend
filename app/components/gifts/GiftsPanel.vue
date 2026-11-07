<template>
  <section class="grid gap-4 lg:grid-cols-2">
    <form class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white" @submit.prevent="redeem">
      <div class="flex items-center gap-2">
        <Ticket :size="18" class="text-violet-300 light:text-violet-700" />
        <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Redeem a code') }}</h2>
      </div>
      <p class="mt-1 text-xs text-white/45 light:text-slate-500">{{ t('Got a gift or an access code? Enter it to unlock the course.') }}</p>
      <div class="mt-3 flex gap-2">
        <input
          v-model="code"
          type="text"
          maxlength="64"
          autocomplete="off"
          spellcheck="false"
          :placeholder="t('Access code')"
          :aria-label="t('Access code')"
          :class="inputClass"
          class="font-mono uppercase"
        >
        <button type="submit" :class="primaryButton" class="shrink-0" :disabled="redeeming || !code.trim()">
          <Loader2 v-if="redeeming" :size="15" class="animate-spin" />
          {{ t('Redeem') }}
        </button>
      </div>
    </form>

    <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
      <div class="flex items-center gap-2">
        <Gift :size="18" class="text-violet-300 light:text-violet-700" />
        <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Gifts you sent') }}</h2>
      </div>
      <p v-if="!gifts.length" class="mt-2 text-xs text-white/45 light:text-slate-500">{{ t('Give a course from its page with "Give as a gift".') }}</p>
      <ul v-else class="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        <li v-for="gift in gifts" :key="gift.codeId" class="flex items-center justify-between gap-2 text-[13px]">
          <div class="min-w-0">
            <NuxtLink :to="`/courses/${gift.courseSlug}`" class="block truncate font-semibold text-slate-100 no-underline hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ gift.courseTitle }}</NuxtLink>
            <span class="text-xs text-white/45 light:text-slate-500">{{ t('To {email}', { email: gift.recipientEmail }) }} · {{ formatDate(gift.sentAt) }}</span>
          </div>
          <span class="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/65 light:border-slate-200 light:bg-slate-100 light:text-slate-600">
            {{ t(ACCESS_CODE_STATUS_LABELS[gift.status] ?? gift.status) }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Gift, Loader2, Ticket } from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'
import { ACCESS_CODE_STATUS_LABELS, useGifts } from '~/composables/useGifts'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import { inputClass, primaryButton } from '~/utils/ui'

/** Redeeming an access code, and the gifts the learner has bought for others. */
const { t } = useT()
const toast = useAppToast()
const { redeemCode, fetchSentGifts } = useGifts()

const { data } = await useAsyncData('sent-gifts', fetchSentGifts, { server: false })
const gifts = computed(() => data.value ?? [])

const code = ref('')
const redeeming = ref(false)

async function redeem() {
  redeeming.value = true
  try {
    const result = await redeemCode(code.value.trim())
    toast.success(t('Course unlocked'), result.courseTitle)
    code.value = ''
    await navigateTo(`/learn/${result.courseSlug}`)
  } catch (err) {
    toast.error(t('Code not redeemed'), getErrorMessage(err, t('Unable to redeem the code')))
  } finally {
    redeeming.value = false
  }
}
</script>
