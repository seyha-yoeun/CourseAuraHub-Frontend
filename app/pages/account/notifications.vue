<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Notifications') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Choose where your notifications reach you.') }}</p>
    </div>

    <div class="max-w-2xl">
      <TelegramCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import TelegramCard from '~/components/account/TelegramCard.vue'

const { t } = useT()

useHead({ title: () => t('Notifications') })
</script>
