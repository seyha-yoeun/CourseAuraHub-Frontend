<template>
  <!-- Sized in cqw so the sheet scales as one piece, from a phone to a printed A4 page. Colors stay fixed in both themes. -->
  <article
    class="certificate-sheet @container relative aspect-[297/210] w-full overflow-hidden bg-[#fdfbf5] font-serif text-[#14213d] shadow-2xl shadow-black/30 print:h-[210mm] print:w-[297mm] print:shadow-none"
    :aria-label="`Certificate of completion for ${certificate.learnerName}`"
  >
    <div class="absolute inset-[2.1cqw] border-[0.3cqw] border-[#14213d]" />
    <div class="absolute inset-[3cqw] border-[0.09cqw] border-[#b08d3c]" />
    <span
      v-for="corner in corners"
      :key="corner"
      class="absolute size-[4cqw] border-[#b08d3c]"
      :class="corner"
    />

    <div class="absolute inset-[3cqw] flex flex-col items-center px-[6cqw] pt-[2.4cqw] pb-[1.9cqw] text-center">
      <svg class="w-[3.4cqw]" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M14 2L26 9V19L14 26L2 19V9L14 2Z" fill="#14213d" />
        <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="#b08d3c" />
      </svg>
      <p class="mt-[0.7cqw] font-sans text-[1cqw] font-bold tracking-[0.3em]">COURSEAURAHUB ACADEMY</p>

      <h2 class="mt-[1.9cqw] text-[3.3cqw] leading-none font-bold tracking-[0.09em]">CERTIFICATE OF COMPLETION</h2>
      <div class="mt-[1cqw] flex items-center gap-[0.8cqw]" aria-hidden="true">
        <span class="h-[0.12cqw] w-[9.5cqw] bg-[#b08d3c]" />
        <span class="size-[0.7cqw] rotate-45 bg-[#b08d3c]" />
        <span class="h-[0.12cqw] w-[9.5cqw] bg-[#b08d3c]" />
      </div>

      <p class="mt-[1.7cqw] text-[1.5cqw] text-[#5c6474] italic">This is to certify that</p>
      <p class="mt-[0.9cqw] line-clamp-1 w-[50cqw] border-b-[0.09cqw] border-[#b08d3c] pb-[0.8cqw] text-[4.3cqw] leading-tight font-bold">
        {{ certificate.learnerName }}
      </p>
      <p class="mt-[1.3cqw] text-[1.5cqw] text-[#5c6474] italic">has successfully completed every lesson of the course</p>
      <p class="mt-[0.9cqw] line-clamp-2 max-w-[74cqw] text-[2.6cqw] leading-tight font-bold">{{ certificate.courseTitle }}</p>

      <div class="mt-auto grid w-full grid-cols-[1fr_auto_1fr_auto] items-end gap-x-[3cqw]">
        <div>
          <p class="line-clamp-1 text-[1.5cqw] font-bold">{{ certificate.instructor }}</p>
          <p class="mt-[0.4cqw] border-t-[0.07cqw] border-[#14213d] pt-[0.5cqw] font-sans text-[0.78cqw] font-bold tracking-[0.15em] text-[#5c6474]">COURSE INSTRUCTOR</p>
        </div>

        <svg class="w-[9cqw]" viewBox="0 0 100 100" aria-hidden="true">
          <polygon :points="sealPoints" fill="#b08d3c" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#fdfbf5" stroke-width="1.2" />
          <path d="M35 50 L46 62 L67 37" fill="none" stroke="#fdfbf5" stroke-width="5" />
        </svg>

        <div>
          <p class="text-[1.5cqw] font-bold">{{ completedOn }}</p>
          <p class="mt-[0.4cqw] border-t-[0.07cqw] border-[#14213d] pt-[0.5cqw] font-sans text-[0.78cqw] font-bold tracking-[0.15em] text-[#5c6474]">DATE OF COMPLETION</p>
        </div>

        <div class="flex flex-col items-center gap-[0.35cqw]">
          <img :src="qrImage" alt="QR code to verify this certificate" class="w-[7.6cqw]">
          <p class="font-sans text-[0.65cqw] font-bold tracking-[0.1em] text-[#5c6474]">SCAN TO VERIFY</p>
        </div>
      </div>

      <p class="mt-[1.1cqw] text-[1.1cqw] font-bold tracking-[0.03em]">Certificate ID {{ certificate.certificateNumber }}</p>
      <p class="mt-[0.15cqw] text-[1cqw] break-all text-[#5c6474]">Verify this certificate at {{ verificationUrl }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { renderSVG } from 'uqr'
import type { CertificateVerification } from '~/types'

const props = defineProps<{
  certificate: CertificateVerification
  verificationUrl: string
}>()

const corners = [
  'top-[3.7cqw] left-[3.7cqw] border-t-[0.24cqw] border-l-[0.24cqw]',
  'top-[3.7cqw] right-[3.7cqw] border-t-[0.24cqw] border-r-[0.24cqw]',
  'bottom-[3.7cqw] left-[3.7cqw] border-b-[0.24cqw] border-l-[0.24cqw]',
  'bottom-[3.7cqw] right-[3.7cqw] border-b-[0.24cqw] border-r-[0.24cqw]'
]

const sealPoints = Array.from({ length: 48 }, (_, i) => {
  const angle = (2 * Math.PI * i) / 48
  const radius = i % 2 === 0 ? 48 : 43
  return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(50 + radius * Math.sin(angle)).toFixed(2)}`
}).join(' ')

// UTC, so the date matches the downloaded PDF wherever it is viewed
const completedOn = computed(() => new Date(props.certificate.issuedAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC'
}))

const qrImage = computed(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderSVG(props.verificationUrl, {
  ecc: 'M',
  border: 0,
  whiteColor: '#fdfbf5',
  blackColor: '#14213d'
}))}`)
</script>

<style>
@media print {
  /* Unnamed on purpose: a named page starts a new sheet, which prints a blank one first */
  @page {
    size: A4 landscape;
    margin: 0;
  }

  .certificate-sheet {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
