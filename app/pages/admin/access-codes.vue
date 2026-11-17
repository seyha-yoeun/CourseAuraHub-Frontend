<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 :class="pageTitle">Access Codes</h1>
      <p :class="pageSubtitle">Codes that unlock a course for free: for partners, giveaways and classes. Learners redeem them from My Learning.</p>
    </div>

    <form :class="cardClass" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" @submit.prevent="issue">
      <div class="lg:col-span-2">
        <label for="code-course" :class="labelClass">Course</label>
        <AppDropdown id="code-course" v-model="form.courseSlug" :options="courseOptions" placeholder="Choose a course" aria-label="Course" />
      </div>
      <div>
        <label for="code-quantity" :class="labelClass">How many codes</label>
        <input id="code-quantity" v-model.number="form.quantity" type="number" min="1" max="500" required :class="inputClass">
      </div>
      <div>
        <label for="code-uses" :class="labelClass">Uses per code</label>
        <input id="code-uses" v-model.number="form.maxUses" type="number" min="1" max="100000" required :class="inputClass">
      </div>
      <div>
        <label for="code-expires" :class="labelClass">Expires (optional)</label>
        <input id="code-expires" v-model="form.expiresAt" type="datetime-local" :class="inputClass">
      </div>
      <div>
        <label for="code-batch" :class="labelClass">Batch name (optional)</label>
        <input id="code-batch" v-model="form.batch" type="text" maxlength="100" placeholder="spring-campus" :class="inputClass">
      </div>
      <div class="flex justify-end sm:col-span-2 lg:col-span-6">
        <button type="submit" :class="primaryButton" :disabled="issuing || !form.courseSlug">
          <Loader2 v-if="issuing" :size="15" class="animate-spin" />
          Issue Codes
        </button>
      </div>
    </form>

    <section v-if="issued" class="rounded-[18px] border border-emerald-500/30 bg-emerald-500/8 p-4 light:border-emerald-200 light:bg-emerald-50">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 :class="sectionTitle">{{ issued.codes.length }} codes in batch {{ issued.batch }}</h2>
          <p class="text-xs text-white/55 light:text-slate-600">Copy them now. Only the last characters are shown again later.</p>
        </div>
        <div class="flex gap-2">
          <button type="button" :class="primaryAction" @click="copyCodes">Copy All</button>
          <button type="button" :class="neutralAction" @click="issued = null">Done</button>
        </div>
      </div>
      <pre class="mt-3 max-h-60 overflow-auto rounded-xl bg-black/30 p-3 font-mono text-xs text-slate-100 light:bg-white light:text-slate-800">{{ issued.codes.join('\n') }}</pre>
    </section>

    <section class="flex flex-col gap-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <h2 :class="sectionTitle">Issued codes</h2>
        <form class="flex gap-2" @submit.prevent="batchFilter = batchInput.trim()">
          <input v-model="batchInput" type="search" placeholder="Filter by batch" aria-label="Filter by batch" :class="inputClass" class="w-48">
          <button type="submit" :class="neutralAction">Filter</button>
        </form>
      </div>

      <div v-if="pending" class="h-32 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
      <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, 'Unable to load access codes') }}</p>
      <p v-else-if="!codes.length" :class="emptyBox">No codes yet.</p>
      <div v-else :class="tableWrap">
        <table class="w-full min-w-200 border-collapse text-left text-[13px]">
          <thead>
            <tr :class="headRow">
              <th class="px-4 py-3 font-semibold">Code</th>
              <th class="px-4 py-3 font-semibold">Course</th>
              <th class="px-4 py-3 font-semibold">Batch</th>
              <th class="px-4 py-3 font-semibold">Uses</th>
              <th class="px-4 py-3 font-semibold">Expires</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="code in codes" :key="code.id">
              <td class="px-4 py-2.5 font-mono text-xs text-slate-100 light:text-slate-800">…{{ code.hint }}</td>
              <td class="px-4 py-2.5 text-white/75 light:text-slate-700">{{ code.courseTitle }}</td>
              <td class="px-4 py-2.5 text-white/60 light:text-slate-500">
                <button v-if="code.batch" type="button" class="cursor-pointer hover:text-violet-300 light:hover:text-violet-700" @click="batchInput = batchFilter = code.batch">{{ code.batch }}</button>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-2.5 text-white/70 light:text-slate-600">{{ code.uses }} / {{ code.maxUses }}</td>
              <td class="px-4 py-2.5 text-white/60 light:text-slate-500">{{ code.expiresAt ? formatDate(code.expiresAt) : 'Never' }}</td>
              <td class="px-4 py-2.5 text-white/70 light:text-slate-600">{{ ACCESS_CODE_STATUS_LABELS[code.status] ?? code.status }}</td>
              <td class="px-4 py-2.5 text-right">
                <button v-if="code.status === 'active'" type="button" :class="dangerAction" :disabled="revokingId === code.id" @click="revoke(code)">Revoke</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { AccessCode, IssuedAccessCodes } from '~/types/gift'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useCourseOptions } from '~/composables/useCourseOptions'
import { ACCESS_CODE_STATUS_LABELS, useGifts } from '~/composables/useGifts'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate, fromLocalInput } from '~/utils/dateTime'
import {
  cardClass, dangerAction, emptyBox, headRow, inputClass, labelClass, neutralAction, pageSubtitle, pageTitle,
  primaryAction, primaryButton, sectionTitle, tableWrap,
} from '~/utils/ui'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Access Codes' })

const toast = useAppToast()
const { fetchAccessCodes, issueAccessCodes, revokeAccessCode } = useGifts()
const { courseOptions } = await useCourseOptions()

const form = reactive({ courseSlug: '', quantity: 10, maxUses: 1, expiresAt: '', batch: '' })
const issuing = ref(false)
const issued = ref<IssuedAccessCodes | null>(null)

const batchInput = ref('')
const batchFilter = ref('')
const { data, pending, error, refresh } = await useAsyncData(
  'admin-access-codes',
  () => fetchAccessCodes(batchFilter.value),
  { server: false, watch: [batchFilter] },
)
const codes = computed(() => data.value ?? [])
const revokingId = ref<number | null>(null)

async function issue() {
  issuing.value = true
  try {
    issued.value = await issueAccessCodes({
      courseSlug: form.courseSlug,
      quantity: form.quantity,
      maxUses: form.maxUses,
      expiresAt: fromLocalInput(form.expiresAt) ?? null,
      batch: form.batch.trim() || null,
    })
    toast.success('Codes Issued', `${issued.value.codes.length} codes in batch ${issued.value.batch}`)
    form.batch = ''
    await refresh()
  } catch (err) {
    toast.error('Codes Not Issued', getErrorMessage(err, 'Unable to issue access codes'))
  } finally {
    issuing.value = false
  }
}

async function copyCodes() {
  if (!issued.value) return
  try {
    await navigator.clipboard.writeText(issued.value.codes.join('\n'))
    toast.success('Codes Copied')
  } catch {
    toast.error('Could not copy', 'Select the codes and copy them manually.')
  }
}

async function revoke(code: AccessCode) {
  revokingId.value = code.id
  try {
    await revokeAccessCode(code.id)
    toast.info('Code Revoked', `…${code.hint}`)
    await refresh()
  } catch (err) {
    toast.error('Not Revoked', getErrorMessage(err, 'Unable to revoke the code'))
  } finally {
    revokingId.value = null
  }
}
</script>
