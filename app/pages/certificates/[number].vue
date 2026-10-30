<template>
  <InfoPageShell
    title="Certificate verification"
    subtitle="Confirm that a CourseAuraHub course completion certificate is genuine."
    :icon="BadgeCheck"
    :sections="[]"
  >
    <template #before>
      <div v-if="pending" class="h-48 animate-pulse rounded-2xl bg-white/5 light:bg-slate-100" />

      <div
        v-else-if="certificate"
        class="rounded-2xl border border-emerald-500/30 bg-emerald-500/6 p-6 sm:p-8 light:border-emerald-200 light:bg-white"
      >
        <p class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 light:text-emerald-700">
          <CheckCircle2 :size="14" /> Verified certificate
        </p>
        <p class="mt-5 text-[13px] text-white/50 light:text-slate-500">This certifies that</p>
        <p class="text-2xl font-extrabold text-slate-50 light:text-slate-900">{{ certificate.learnerName }}</p>
        <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">completed the course</p>
        <p class="text-lg font-bold text-slate-100 light:text-slate-900">{{ certificate.courseTitle }}</p>
        <p class="text-[13px] text-white/50 light:text-slate-500">taught by {{ certificate.instructor }}</p>

        <dl class="mt-6 grid grid-cols-1 gap-3 border-t border-white/8 pt-4 text-xs sm:grid-cols-2 light:border-slate-200">
          <div>
            <dt class="text-white/40 light:text-slate-400">Issued</dt>
            <dd class="font-semibold text-slate-200 light:text-slate-700">{{ formatDate(certificate.issuedAt) }}</dd>
          </div>
          <div>
            <dt class="text-white/40 light:text-slate-400">Certificate number</dt>
            <dd class="font-mono font-semibold text-slate-200 light:text-slate-700">{{ certificate.certificateNumber }}</dd>
          </div>
        </dl>
      </div>

      <div
        v-else-if="error"
        class="rounded-2xl border border-amber-400/30 bg-amber-400/8 p-6 text-center light:border-amber-200 light:bg-amber-50"
      >
        <AlertCircle :size="28" class="mx-auto text-amber-400 light:text-amber-600" />
        <p class="mt-2 text-sm font-bold text-slate-100 light:text-slate-900">We couldn't check this certificate right now</p>
        <p class="mt-1 text-[13px] text-white/50 light:text-slate-500">This doesn't mean it's invalid. Please try again in a moment.</p>
        <button type="button" class="mt-3 cursor-pointer text-xs font-semibold text-violet-300 underline light:text-violet-700" @click="refresh()">Try again</button>
      </div>

      <div
        v-else
        class="rounded-2xl border border-rose-500/25 bg-rose-500/8 p-6 text-center light:border-rose-200 light:bg-rose-50"
      >
        <XCircle :size="28" class="mx-auto text-rose-400 light:text-rose-600" />
        <p class="mt-2 text-sm font-bold text-slate-100 light:text-slate-900">No certificate matches this number</p>
        <p class="mt-1 text-[13px] text-white/50 light:text-slate-500">
          Check the number for typos. Certificate numbers look like <span class="font-mono">CAH-XXXX-XXXX-XXXX-XXXX</span>.
        </p>
      </div>
    </template>
  </InfoPageShell>
</template>

<script setup lang="ts">
import { AlertCircle, BadgeCheck, CheckCircle2, XCircle } from 'lucide-vue-next'
import InfoPageShell from '~/components/shared/InfoPageShell.vue'
import { useLearning } from '~/composables/useLearning'
import { toApiError } from '~/utils/apiError'

definePageMeta({ layout: false })
useHead({ title: 'Verify certificate' })

const route = useRoute()
const { verifyCertificate } = useLearning()
const number = computed(() => String(route.params.number))

// A 404 is an expected outcome on this page. Anything else must not read as "this certificate is fake"
const { data: certificate, pending, error, refresh } = await useAsyncData(
  () => `certificate-${number.value}`,
  () => verifyCertificate(number.value).catch((err) => {
    if (toApiError(err).status === 404) return null
    throw err
  })
)

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
