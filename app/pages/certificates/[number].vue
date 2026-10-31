<template>
  <InfoPageShell
    title="Certificate verification"
    subtitle="Confirm that a CourseAuraHub course completion certificate is genuine."
    :icon="BadgeCheck"
    :sections="[]"
  >
    <template #before>
      <div v-if="pending" class="h-48 animate-pulse rounded-2xl bg-white/5 light:bg-slate-100" />

      <div v-else-if="certificate" class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 light:text-emerald-700">
            <CheckCircle2 :size="14" /> Verified certificate
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 light:hover:text-slate-900"
              @click="copyLink(certificate.certificateNumber)"
            >
              <Link2 :size="14" /> Copy link
            </button>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 light:hover:text-slate-900"
              @click="printCertificate"
            >
              <Printer :size="14" /> Print
            </button>
            <button
              v-if="isOwner"
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60"
              :disabled="downloading"
              @click="download(certificate.certificateNumber)"
            >
              <Download :size="14" /> {{ downloading ? 'Preparing...' : 'Download PDF' }}
            </button>
          </div>
        </div>

        <CertificateDocument :certificate="certificate" :verification-url="verificationUrl" />
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
import { AlertCircle, BadgeCheck, CheckCircle2, Download, Link2, Printer, XCircle } from 'lucide-vue-next'
import CertificateDocument from '~/components/learning/CertificateDocument.vue'
import InfoPageShell from '~/components/shared/InfoPageShell.vue'
import { useCertificateActions } from '~/composables/useCertificateActions'
import { useLearning } from '~/composables/useLearning'
import { toApiError } from '~/utils/apiError'

definePageMeta({ layout: false })
useHead({ title: 'Verify certificate' })

const route = useRoute()
const auth = useAuth()
const requestOrigin = useRequestURL().origin
const { verifyCertificate, fetchCertificates } = useLearning()
const { downloading, download, copyLink } = useCertificateActions()
const number = computed(() => String(route.params.number))

// A 404 is an expected outcome on this page. Anything else must not read as "this certificate is fake"
const { data: certificate, pending, error, refresh } = await useAsyncData(
  () => `certificate-${number.value}`,
  () => verifyCertificate(number.value).catch((err) => {
    if (toApiError(err).status === 404) return null
    throw err
  })
)

const verificationUrl = computed(() => new URL(`/certificates/${number.value}`, requestOrigin).toString())

// Only the learner who earned a certificate can download it; anyone can print the page
const isOwner = ref(false)

async function checkOwnership() {
  if (!auth.isAuthenticated) {
    isOwner.value = false
    return
  }
  const mine = await fetchCertificates().catch(() => [])
  isOwner.value = mine.some(item => item.certificateNumber === certificate.value?.certificateNumber)
}

function printCertificate() {
  window.print()
}

onMounted(checkOwnership)
watch(() => auth.isAuthenticated, checkOwnership)
</script>
