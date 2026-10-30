<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Account Security</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">
          Manage your password, two-factor authentication, and signed-in devices.
        </p>
      </div>

      <div class="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 light:border-slate-200 light:bg-white">
        <Mail :size="15" class="text-white/40 light:text-slate-400" />
        <span class="max-w-60 truncate text-[13px] font-medium text-slate-200 light:text-slate-800">{{ auth.userEmail }}</span>
        <span class="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/12 px-1.5 py-px text-[10px] font-bold text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700">
          <BadgeCheck :size="11" />
          Verified
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div class="flex flex-col gap-5">
        <ChangePasswordCard @changed="sessionsCard?.refresh()" />
        <TwoFactorCard />
      </div>

      <ActiveSessionsCard ref="sessionsCard" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BadgeCheck, Mail } from 'lucide-vue-next'
import ActiveSessionsCard from '~/components/account/ActiveSessionsCard.vue'
import ChangePasswordCard from '~/components/account/ChangePasswordCard.vue'
import TwoFactorCard from '~/components/account/TwoFactorCard.vue'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()
const sessionsCard = ref<InstanceType<typeof ActiveSessionsCard> | null>(null)

useHead({
  title: 'Account Security',
})
</script>
