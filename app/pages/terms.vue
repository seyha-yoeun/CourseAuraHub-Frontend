<template>
  <InfoPageShell
    title="Terms of Service"
    subtitle="The rules and guidelines for using CourseAuraHub Academy."
    :icon="ScrollText"
    :sections="sections"
    updated="October 2026"
  />
</template>

<script setup lang="ts">
import { ScrollText } from 'lucide-vue-next'
import InfoPageShell from '~/components/shared/InfoPageShell.vue'

definePageMeta({ layout: false })
useHead({ title: 'Terms of Service' })

const sections = [
  { heading: 'Accepting these terms', body: 'By creating an account or using CourseAuraHub Academy, you agree to these terms. If you do not agree, please do not use the platform.' },
  { heading: 'Your account', body: 'You are responsible for keeping your credentials secure and for all activity under your account. Notify us immediately if you suspect unauthorized access.' },
  { heading: 'Course access & licensing', body: 'Purchased courses grant you a personal, non-transferable license to view the content. Redistributing, reselling, or publicly sharing course materials is not permitted.' },
  { heading: 'Payments & refunds', body: 'Prices are shown at checkout. Refund requests are reviewed case by case and may be granted within 14 days of purchase if minimal course content has been consumed.' },
  { heading: 'Acceptable use', body: 'Do not misuse the platform, attempt to disrupt the service, or access data that does not belong to you. We may suspend accounts that violate these terms.' }
]
</script>
