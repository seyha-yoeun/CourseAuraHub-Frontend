<template>
  <InfoPageShell
    title="Privacy Policy"
    subtitle="How CourseAuraHub Academy collects, uses, and protects your information."
    :icon="ShieldCheck"
    :sections="sections"
    updated="October 2026"
  />
</template>

<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
import InfoPageShell from '~/components/shared/InfoPageShell.vue'

definePageMeta({ layout: false })
useHead({ title: 'Privacy Policy' })

const sections = [
  { heading: 'Information we collect', body: 'We collect the details you provide when creating an account — such as your name, email address, and profile image — along with course enrollment and purchase records needed to deliver the platform.' },
  { heading: 'How we use your data', body: 'Your information is used to authenticate you, provide access to purchased courses, track learning progress, process payments, and send essential account notifications. We never sell your personal data.' },
  { heading: 'Cookies & sessions', body: 'We use secure, HTTP-only cookies to keep you signed in and to protect your session. These cookies are required for the platform to function and are not used for third-party advertising.' },
  { heading: 'Data retention & security', body: 'Account data is retained while your account is active. Data is encrypted in transit, and access is limited to authorized staff who need it to operate the service.' },
  { heading: 'Your rights', body: 'You may request a copy of your data, ask for corrections, or request deletion of your account at any time by contacting our support team.' }
]
</script>
