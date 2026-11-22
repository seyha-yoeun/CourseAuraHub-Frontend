<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 :class="pageTitle">{{ t('Access Codes') }}</h1>
      <p :class="pageSubtitle">{{ t('Codes that unlock a course for free: for partners, giveaways and classes. Learners redeem them from My Learning.') }}</p>
    </div>

    <form :class="cardClass" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" @submit.prevent="issue">
      <div class="lg:col-span-2">
        <label for="code-course" :class="labelClass">{{ t('Course') }}</label>
        <AppDropdown id="code-course" v-model="form.courseSlug" :options="courseOptions" :placeholder="t('Choose a course')" :aria-label="t('Course')" />
      </div>
      <div>
        <label for="code-quantity" :class="labelClass">{{ t('How many codes') }}</label>
        <input id="code-quantity" v-model.number="form.quantity" type="number" min="1" max="500" required :class="inputClass">
      </div>
      <div>
        <label for="code-uses" :class="labelClass">{{ t('Uses per code') }}</label>
        <input id="code-uses" v-model.number="form.maxUses" type="number" min="1" max="100000" required :class="inputClass">
      </div>
      <div>
        <label for="code-expires" :class="labelClass">{{ t('Expires (optional)') }}</label>
        <input id="code-expires" v-model="form.expiresAt" type="datetime-local" :class="inputClass">
      </div>
      <div>
        <label for="code-batch" :class="labelClass">{{ t('Batch name (optional)') }}</label>
        <input id="code-batch" v-model="form.batch" type="text" maxlength="100" :placeholder="t('spring-campus')" :class="inputClass">
      </div>
      <div class="flex justify-end sm:col-span-2 lg:col-span-6">
        <button type="submit" :class="primaryButton" :disabled="issuing || !form.courseSlug">
          <Loader2 v-if="issuing" :size="15" class="animate-spin" />
          {{ t('Issue Codes') }}
        </button>
      </div>
    </form>

    <section v-if="issued" class="rounded-[18px] border border-emerald-500/30 bg-emerald-500/8 p-4 light:border-emerald-200 light:bg-emerald-50">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 :class="sectionTitle">{{ t('{codes} codes in batch {batch}', { codes: issued.codes.length, batch: issued.batch }) }}</h2>
          <p class="text-xs text-white/55 light:text-slate-600">{{ t('Copy them now if you need them. You can also show any code again later from its details.') }}</p>
        </div>
        <div class="flex gap-2">
          <button type="button" :class="primaryAction" @click="copyCodes">{{ t('Copy All') }}</button>
          <button type="button" :class="neutralAction" @click="issued = null">{{ t('Done') }}</button>
        </div>
      </div>
      <pre class="mt-3 max-h-60 overflow-auto rounded-xl bg-black/30 p-3 font-mono text-xs text-slate-100 light:bg-white light:text-slate-800">{{ issued.codes.join('\n') }}</pre>
    </section>

    <section class="flex flex-col gap-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <h2 :class="sectionTitle">{{ t('Issued codes') }}</h2>
        <form class="flex gap-2" @submit.prevent="batchFilter = batchInput.trim()">
          <input v-model="batchInput" type="search" :placeholder="t('Filter by batch')" :aria-label="t('Filter by batch')" :class="inputClass" class="w-48">
          <button type="submit" :class="neutralAction">{{ t('Filter') }}</button>
        </form>
      </div>

      <div v-if="pending" class="h-32 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
      <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load access codes')) }}</p>
      <p v-else-if="!codes.length" :class="emptyBox">{{ t('No codes yet.') }}</p>
      <DataTableFrame v-else :label="t('Access codes')" :scroll-key="tableScrollKey">
        <table class="w-full min-w-200 border-collapse text-left text-[13px]">
          <thead>
            <tr :class="headRow">
              <th class="px-4 py-3 font-semibold">{{ t('Code') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Course') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Batch') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Uses') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Issued') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Expires') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('Status') }}</th>
              <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/6 light:divide-slate-200">
            <tr v-for="code in tableItems" :key="code.id">
              <td class="px-4 py-2.5">
                <button
                  type="button"
                  class="cursor-pointer rounded font-mono text-[13px] text-slate-100 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-800 light:hover:text-brand-600"
                  :aria-label="`View details for code ending in ${code.hint}`"
                  @click="selectedId = code.id"
                >
                  <span class="text-white/30 light:text-slate-300" aria-hidden="true">••••</span> {{ code.hint }}
                </button>
              </td>
              <td class="px-4 py-2.5 text-white/75 light:text-slate-700">{{ code.courseTitle }}</td>
              <td class="px-4 py-2.5 text-white/60 light:text-slate-500">
                <button v-if="code.batch" type="button" class="cursor-pointer hover:text-brand-300 light:hover:text-brand-700" @click="batchInput = batchFilter = code.batch">{{ code.batch }}</button>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-2.5 text-white/70 light:text-slate-600">{{ code.uses }} / {{ code.maxUses }}</td>
              <td class="px-4 py-2.5 whitespace-nowrap text-white/60 light:text-slate-500">{{ formatDate(code.createdAt) }}</td>
              <td class="px-4 py-2.5 whitespace-nowrap text-white/60 light:text-slate-500">{{ code.expiresAt ? formatDate(code.expiresAt) : t('Never') }}</td>
              <td class="px-4 py-2.5">
                <span class="rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap" :class="statusBadge(code.status)">{{ ACCESS_CODE_STATUS_LABELS[code.status] ?? code.status }}</span>
              </td>
              <td class="px-4 py-2.5 text-right whitespace-nowrap">
                <button type="button" :class="neutralAction" @click="selectedId = code.id">{{ t('Details') }}</button>
                <button v-if="code.status === 'active'" type="button" :class="[dangerAction, 'ml-2']" :disabled="revokingId === code.id" @click="revoke(code)">{{ t('Revoke') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        <template #footer>
          <TablePagination v-model:page="tablePage" v-model:page-size="tablePageSize" :total="tableTotal" />
        </template>
      </DataTableFrame>
    </section>

    <AccessCodeDetailsModal
      :code="selectedCode"
      :revoking="revokingId === selectedCode?.id"
      @close="selectedId = null"
      @revoke="revoke"
      @filter-batch="showBatch"
    />
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { useClientPagination } from '~/composables/useClientPagination'
import { Loader2 } from 'lucide-vue-next'
import type { AccessCode, IssuedAccessCodes } from '~/types/gift'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import AccessCodeDetailsModal from '~/components/gifts/AccessCodeDetailsModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useCourseOptions } from '~/composables/useCourseOptions'
import { ACCESS_CODE_STATUS_LABELS, useGifts } from '~/composables/useGifts'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate, fromLocalInput } from '~/utils/dateTime'
import {
  cardClass, dangerAction, emptyBox, headRow, inputClass, labelClass, neutralAction, pageSubtitle, pageTitle,
  primaryAction, primaryButton, sectionTitle,
} from '~/utils/ui'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Access Codes') })

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
const { page: tablePage, pageSize: tablePageSize, total: tableTotal, items: tableItems, scrollKey: tableScrollKey } = useClientPagination(codes, { resetOn: [batchFilter] })
const revokingId = ref<number | null>(null)

// Details dialog follows the row by id, so it shows fresh data after a revoke
const selectedId = ref<number | null>(null)
const selectedCode = computed(() => codes.value.find(code => code.id === selectedId.value) ?? null)

function showBatch(batch: string) {
  batchInput.value = batch
  batchFilter.value = batch
  selectedId.value = null
}

function statusBadge(status: string) {
  if (status === 'active') return 'bg-emerald-400/12 text-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  if (status === 'awaiting_payment') return 'bg-amber-400/12 text-amber-300 light:bg-amber-50 light:text-warning'
  if (status === 'revoked') return 'bg-rose-400/12 text-rose-300 light:bg-negative-bg light:text-negative'
  return 'bg-white/8 text-white/60 light:bg-slate-100 light:text-slate-600'
}

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
    toast.success(t('Codes Issued'), `${issued.value.codes.length} codes in batch ${issued.value.batch}`)
    form.batch = ''
    await refresh()
  } catch (err) {
    toast.error(t('Codes Not Issued'), getErrorMessage(err, t('Unable to issue access codes')))
  } finally {
    issuing.value = false
  }
}

async function copyCodes() {
  if (!issued.value) return
  try {
    await navigator.clipboard.writeText(issued.value.codes.join('\n'))
    toast.success(t('Codes Copied'))
  } catch {
    toast.error(t('Could not copy'), t('Select the codes and copy them manually.'))
  }
}

async function revoke(code: AccessCode) {
  revokingId.value = code.id
  try {
    await revokeAccessCode(code.id)
    toast.info(t('Code Revoked'), `…${code.hint}`)
    await refresh()
  } catch (err) {
    toast.error(t('Not Revoked'), getErrorMessage(err, t('Unable to revoke the code')))
  } finally {
    revokingId.value = null
  }
}
</script>
