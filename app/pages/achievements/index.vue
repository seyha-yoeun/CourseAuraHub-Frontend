<template>
  <div class="flex flex-col gap-8">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Achievements</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Badges you've unlocked and the certificates you've earned by finishing courses.</p>
    </div>

    <section aria-labelledby="badges-heading" class="flex flex-col gap-3">
      <div class="flex items-baseline justify-between gap-3">
        <h2 id="badges-heading" class="text-base font-bold text-slate-100 light:text-slate-900">Badges</h2>
        <span v-if="achievements" class="text-xs text-white/45 light:text-slate-500">{{ earnedCount }} of {{ achievements.length }} unlocked</span>
      </div>

      <div v-if="achievementsPending" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-28 animate-pulse rounded-2xl bg-white/5 light:bg-slate-100" />
      </div>
      <p v-else-if="achievementsError" class="rounded-2xl border border-rose-500/25 bg-rose-500/8 px-5 py-6 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
        {{ getErrorMessage(achievementsError, 'Unable to load your achievements') }}
      </p>
      <ul v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="badge in achievements"
          :key="badge.code"
          class="flex gap-3.5 rounded-2xl border p-4"
          :class="badge.earned
            ? 'border-amber-400/30 bg-amber-400/8 light:border-amber-300 light:bg-amber-50'
            : 'border-white/8 bg-white/3 light:border-slate-200 light:bg-white'"
        >
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-xl"
            :class="badge.earned ? 'bg-amber-400/20 text-amber-300 light:text-amber-600' : 'bg-white/6 text-white/30 light:bg-slate-100 light:text-slate-400'"
          >
            <component :is="badgeIcon(badge)" :size="20" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 text-sm font-bold text-slate-100 light:text-slate-900">
              {{ badge.title }}
              <span v-if="badge.earned" class="sr-only">(unlocked)</span>
            </p>
            <p class="text-xs text-white/50 light:text-slate-500">{{ badge.description }}</p>
            <div v-if="!badge.earned" class="mt-2">
              <ProgressBar :value="Math.round((badge.progress / badge.target) * 100)" :label="`${badge.title} progress`" />
              <p class="mt-1 text-[11px] text-white/40 light:text-slate-400">{{ badge.progress }} / {{ badge.target }}</p>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="certificates-heading" class="flex flex-col gap-3">
      <h2 id="certificates-heading" class="text-base font-bold text-slate-100 light:text-slate-900">Certificates</h2>

      <div v-if="certificatesPending" class="h-24 animate-pulse rounded-2xl bg-white/5 light:bg-slate-100" />
      <p v-else-if="certificatesError" class="rounded-2xl border border-rose-500/25 bg-rose-500/8 px-5 py-6 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
        {{ getErrorMessage(certificatesError, 'Unable to load your certificates') }}
      </p>
      <div v-else-if="!certificates?.length" class="flex flex-col items-center rounded-2xl border border-white/10 bg-white/4 px-6 py-10 text-center light:border-slate-200 light:bg-white">
        <Award :size="28" class="text-white/30 light:text-slate-400" />
        <p class="mt-2 text-[13px] text-white/50 light:text-slate-500">Finish every lesson in a course to earn its certificate.</p>
        <NuxtLink to="/my-learning" class="mt-3 text-xs font-semibold text-violet-300 light:text-violet-700">Go to My Learning</NuxtLink>
      </div>
      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="certificate in certificates"
          :key="certificate.certificateNumber"
          class="flex flex-wrap items-center gap-4 rounded-2xl border border-white/8 bg-white/4 p-4 light:border-slate-200 light:bg-white"
        >
          <img :src="certificate.thumbnail" alt="" class="hidden aspect-video w-28 shrink-0 rounded-lg object-cover sm:block">
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/courses/${certificate.courseSlug}`" class="text-sm font-bold text-slate-100 no-underline hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">
              {{ certificate.courseTitle }}
            </NuxtLink>
            <p class="text-xs text-white/50 light:text-slate-500">{{ certificate.instructor }} · Issued {{ formatDate(certificate.issuedAt) }}</p>
            <p class="mt-1 font-mono text-[11px] text-white/40 light:text-slate-400">{{ certificate.certificateNumber }}</p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 light:hover:text-slate-900"
              @click="copyLink(certificate.certificateNumber)"
            >
              <Link2 :size="14" /> Copy link
            </button>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white disabled:cursor-wait disabled:opacity-60 light:border-slate-200 light:bg-white light:text-slate-600 light:hover:text-slate-900"
              :disabled="downloading"
              @click="download(certificate.certificateNumber)"
            >
              <Download :size="14" /> PDF
            </button>
            <NuxtLink
              :to="verifyPath(certificate)"
              class="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 no-underline hover:bg-violet-500/30 hover:text-white light:border-violet-300 light:bg-violet-50 light:text-violet-700"
            >
              <BadgeCheck :size="14" /> View
            </NuxtLink>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Award, BadgeCheck, BookOpenCheck, Download, Flame, GraduationCap, Link2, MessageSquareQuote } from 'lucide-vue-next'
import type { Achievement, Certificate } from '~/types'
import ProgressBar from '~/components/learning/ProgressBar.vue'
import { useCertificateActions } from '~/composables/useCertificateActions'
import { useLearning } from '~/composables/useLearning'
import { getErrorMessage } from '~/utils/apiError'

useHead({ title: 'Achievements' })

const { fetchAchievements, fetchCertificates } = useLearning()
const { downloading, download, copyLink } = useCertificateActions()

const { data: achievements, pending: achievementsPending, error: achievementsError } =
  await useAsyncData('my-achievements', fetchAchievements, { server: false })
const { data: certificates, pending: certificatesPending, error: certificatesError } =
  await useAsyncData('my-certificates', fetchCertificates, { server: false })

const earnedCount = computed(() => achievements.value?.filter(badge => badge.earned).length ?? 0)

const METRIC_ICONS = {
  lessons_completed: BookOpenCheck,
  certificates_earned: GraduationCap,
  longest_streak_days: Flame,
  reviews_written: MessageSquareQuote
} as const

function badgeIcon(badge: Achievement) {
  return METRIC_ICONS[badge.metric] ?? Award
}

function verifyPath(certificate: Certificate) {
  return `/certificates/${certificate.certificateNumber}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
