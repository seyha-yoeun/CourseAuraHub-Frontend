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
import { BadgeCheck, CheckCircle2, XCircle } from 'lucide-vue-next'
import InfoPageShell from '~/components/shared/InfoPageShell.vue'
import { useLearning } from '~/composables/useLearning'

definePageMeta({ layout: false })
useHead({ title: 'Verify certificate' })

const route = useRoute()
const { verifyCertificate } = useLearning()
const number = computed(() => String(route.params.number))

// A missing certificate is an expected outcome on this page, so render it instead of throwing
const { data: certificate, pending } = await useAsyncData(
  () => `certificate-${number.value}`,
  () => verifyCertificate(number.value).catch(() => null)
)

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
