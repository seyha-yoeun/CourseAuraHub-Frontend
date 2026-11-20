<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 :class="pageTitle">{{ t('Invite friends') }}</h1>
      <p :class="pageSubtitle">
        <template v-if="data">{{ t('Share your code. When a friend buys their first course, {amount} goes onto your member card.', { amount: formatMoney(data.rewardAmount, data.currency) }) }}</template>
        <template v-else>{{ t('Share your code and earn member card credit when friends buy their first course.') }}</template>
      </p>
    </div>

    <div v-if="pending" class="h-40 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load your referral code')) }}</p>

    <template v-else-if="data">
      <section class="flex flex-col gap-4 rounded-[20px] border border-violet-500/35 bg-linear-to-br from-violet-700/40 to-indigo-800/40 p-5 light:border-violet-200 light:from-violet-50 light:to-indigo-50">
        <div>
          <p class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-violet-700">{{ t('Your referral code') }}</p>
          <p class="mt-1 font-mono text-3xl font-extrabold tracking-widest text-white light:text-slate-900">{{ data.code }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input :value="data.link" type="text" readonly :aria-label="t('Your invite link')" class="min-w-0 flex-1" :class="inputClass" @focus="($event.target as HTMLInputElement).select()">
          <button type="button" :class="primaryButton" @click="copyLink">
            <Copy :size="15" /> {{ t('Copy link') }}
          </button>
          <button v-if="canShare" type="button" :class="primaryButton" @click="share">
            <Share2 :size="15" /> {{ t('Share') }}
          </button>
        </div>
        <p class="text-xs text-white/60 light:text-slate-600">{{ t('Friends use it in their first days on the site, before their first purchase. Rewards arrive after the refund window and need a member card.') }}</p>
      </section>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="tile in tiles" :key="tile.label" :class="cardClass">
          <p class="text-xs text-white/45 light:text-slate-500">{{ t(tile.label) }}</p>
          <p class="mt-1 text-xl font-extrabold text-slate-50 light:text-slate-900">{{ tile.value }}</p>
        </div>
      </div>

      <section :class="cardClass">
        <h2 :class="sectionTitle">{{ t('Friends') }}</h2>
        <p v-if="!data.friends.length" class="mt-2 text-xs text-white/45 light:text-slate-500">{{ t('Nobody has used your code yet.') }}</p>
        <ul v-else class="m-0 mt-3 flex list-none flex-col divide-y divide-white/6 p-0 light:divide-slate-200">
          <li v-for="(friend, index) in data.friends" :key="index" class="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]">
            <span class="font-semibold text-slate-100 light:text-slate-900">{{ friend.firstName }}</span>
            <span class="text-xs text-white/50 light:text-slate-500">{{ t('Joined {date}', { date: formatDate(friend.joinedAt) }) }}</span>
            <span class="inline-flex rounded-full border px-2.5 py-0.75 text-[11px] font-semibold" :class="statusClass[friend.status]">{{ t(REFERRAL_STATUS_LABELS[friend.status]) }}</span>
          </li>
        </ul>
      </section>

      <section :class="cardClass">
        <h2 :class="sectionTitle">{{ t('Were you invited?') }}</h2>
        <p class="mt-1 text-xs text-white/45 light:text-slate-500">{{ t('Enter a friend\'s code in your first days on the site, before your first purchase.') }}</p>
        <form class="mt-3 flex flex-wrap items-center gap-2" @submit.prevent="useCode">
          <input v-model="friendCode" type="text" maxlength="20" :placeholder="t('Referral code')" :aria-label="t('Referral code')" class="w-48 font-mono uppercase" :class="inputClass">
          <button type="submit" :class="primaryAction" :disabled="claiming || !friendCode.trim()">{{ t('Use code') }}</button>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Copy, Share2 } from 'lucide-vue-next'
import type { ReferralStatus } from '~/types/referral'
import { formatMoney } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { REFERRAL_STATUS_LABELS, useReferral } from '~/composables/useReferral'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import { cardClass, emptyBox, inputClass, pageSubtitle, pageTitle, primaryAction, primaryButton, sectionTitle } from '~/utils/ui'

const { t } = useT()
useHead({ title: () => t('Invite friends') })

const toast = useAppToast()
const { fetchMine, claim } = useReferral()

const { data, pending, error } = await useAsyncData('my-referral', fetchMine, { server: false })

const tiles = computed(() => data.value
  ? [
      { label: 'Signed up', value: data.value.signedUp },
      { label: 'Bought a course', value: data.value.qualified },
      { label: 'Rewards paid', value: data.value.rewarded },
      { label: 'Earned', value: formatMoney(data.value.earned, data.value.currency) },
    ]
  : [])

const statusClass: Record<ReferralStatus, string> = {
  signed_up: 'border-slate-400/30 bg-slate-400/12 text-slate-300 light:border-slate-300 light:bg-slate-100 light:text-slate-600',
  qualified: 'border-amber-400/30 bg-amber-400/12 text-amber-300 light:border-amber-200 light:bg-amber-50 light:text-amber-700',
  rewarded: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700',
}

const canShare = import.meta.client && typeof navigator.share === 'function'

async function copyLink() {
  if (!data.value) return
  try {
    await navigator.clipboard.writeText(data.value.link)
    toast.success(t('Invite link copied'))
  } catch {
    toast.info(t('Select the invite link and copy it'))
  }
}

async function share() {
  if (!data.value) return
  try {
    await navigator.share({ title: 'CourseAuraHub', text: t('Join me on CourseAuraHub with my code {code}', { code: data.value.code }), url: data.value.link })
  } catch {
    // Closing the share sheet isn't an error
  }
}

const friendCode = ref('')
const claiming = ref(false)

async function useCode() {
  claiming.value = true
  try {
    const result = await claim(friendCode.value)
    friendCode.value = ''
    toast.success(t('Code applied'), result.referrerFirstName ? t('{name} invited you. Welcome!', { name: result.referrerFirstName }) : undefined)
  } catch (err) {
    toast.error(t('Code not applied'), getErrorMessage(err, t('Unable to use this referral code')))
  } finally {
    claiming.value = false
  }
}
</script>
