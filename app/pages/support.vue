<template>
  <InfoPageShell
    title="Support Center"
    subtitle="Answers to common questions and ways to reach our team."
    :icon="LifeBuoy"
    :sections="faqs"
  >
    <template #before>
      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <NuxtLink
          v-for="channel in channels"
          :key="channel.label"
          :to="channel.href"
          class="group flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/3 p-4.5 no-underline transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-violet-500/35 hover:bg-violet-500/8 hover:shadow-[0_12px_28px_-14px_rgba(124,58,237,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-white light:hover:border-violet-300"
        >
          <component :is="channel.icon" :size="18" class="text-violet-300 transition-transform duration-300 group-hover:scale-110 light:text-violet-600" />
          <span class="text-sm font-bold text-slate-100 light:text-slate-900">{{ channel.label }}</span>
          <span class="text-xs text-white/50 light:text-slate-500">{{ channel.desc }}</span>
        </NuxtLink>
      </div>
    </template>
  </InfoPageShell>
</template>

<script setup lang="ts">
import { LifeBuoy, Mail, BookOpen, ShieldCheck } from 'lucide-vue-next'
import InfoPageShell from '~/components/shared/InfoPageShell.vue'

definePageMeta({ layout: false })
useHead({ title: 'Support' })

const channels = [
  { label: 'Email support', desc: 'support@courseaurahub.com', href: 'mailto:support@courseaurahub.com', icon: Mail },
  { label: 'Terms of Service', desc: 'Licensing, payments & refunds', href: '/terms', icon: BookOpen },
  { label: 'Privacy Policy', desc: 'How we handle your data', href: '/privacy', icon: ShieldCheck }
]

const faqs = [
  { heading: 'I forgot my password', body: 'Use the "Forgot password" link on the sign-in page. We will email you a secure link to reset it; the link expires after a short time for your safety.' },
  { heading: 'I cannot access a course I purchased', body: 'Sign out and back in to refresh your session. If the course still does not appear, email us with your purchase details and we will restore access.' },
  { heading: 'How do I request a refund?', body: 'Contact support within 14 days of purchase with the course name and the email on your account. Refund eligibility is described in our Terms of Service.' },
  { heading: 'Keyboard shortcuts', body: 'Press Ctrl+K to search, Ctrl+B to toggle the sidebar, and ? or Ctrl+H to open the in-app help guide from anywhere in the dashboard.' }
]
</script>
