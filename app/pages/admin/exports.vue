<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 :class="pageTitle">{{ t('CSV Exports') }}</h1>
      <p :class="pageSubtitle">{{ t('Download platform data for accounting and reporting. Files open in Excel with Khmer names intact.') }}</p>
    </div>

    <div :class="cardClass" class="grid gap-3 sm:grid-cols-3">
      <div>
        <label for="export-from" :class="labelClass">{{ t('From') }}</label>
        <input id="export-from" v-model="from" type="date" :max="to || undefined" :class="inputClass">
      </div>
      <div>
        <label for="export-to" :class="labelClass">{{ t('To') }}</label>
        <input id="export-to" v-model="to" type="date" :min="from || undefined" :class="inputClass">
      </div>
      <p class="self-end text-xs text-white/45 light:text-slate-500">{{ t('Leave the dates empty to export everything. The learner list ignores dates.') }}</p>
    </div>

    <ul class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
      <li v-for="item in exportsList" :key="item.name" :class="cardClass" class="flex flex-col gap-3">
        <div class="flex items-start gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/12">
            <component :is="item.icon" :size="20" class="text-brand-300 light:text-brand-700" />
          </div>
          <div>
            <h2 :class="sectionTitle">{{ item.title }}</h2>
            <p class="mt-0.5 text-xs text-white/50 light:text-slate-500">{{ item.description }}</p>
          </div>
        </div>
        <div class="mt-auto flex flex-wrap items-center gap-2">
          <div v-if="item.name === 'orders'" class="w-44">
            <AppDropdown v-model="orderStatus" :options="orderStatusOptions" size="sm" :aria-label="t('Order status')" />
          </div>
          <button type="button" :class="primaryButton" class="ml-auto" :disabled="busy === item.name" @click="download(item.name)">
            <Loader2 v-if="busy === item.name" :size="15" class="animate-spin" />
            <Download v-else :size="15" />
            {{ t('Download CSV') }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { CreditCard, Download, GraduationCap, Loader2, Receipt, ScrollText, UserPlus } from 'lucide-vue-next'
import type { Component } from 'vue'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { type AdminExport, useExports } from '~/composables/useExports'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'
import { cardClass, inputClass, labelClass, pageSubtitle, pageTitle, primaryButton, sectionTitle } from '~/utils/ui'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: 'CSV Exports' })

const toast = useAppToast()
const { downloadExport } = useExports()

const from = ref('')
const to = ref('')
const orderStatus = ref('all')
const busy = ref<AdminExport | null>(null)

const orderStatusOptions = [
  { value: 'all', label: t('All statuses') },
  { value: 'PAID', label: t('Paid') },
  { value: 'REFUNDED', label: t('Refunded') },
  { value: 'PENDING', label: t('Pending') },
  { value: 'FAILED', label: t('Failed') },
  { value: 'CANCELLED', label: t('Cancelled') },
]

const exportsList: { name: AdminExport, title: string, description: string, icon: Component }[] = [
  { name: 'orders', title: t('Orders'), description: t('Every order with amounts, coupon, provider and status.'), icon: Receipt },
  { name: 'enrollments', title: t('Enrollments'), description: t('Who enrolled in which course, and when.'), icon: UserPlus },
  { name: 'learners', title: t('Learners'), description: t('All learners with their spend and course counts.'), icon: GraduationCap },
  { name: 'member-card-ledger', title: t('Member card ledger'), description: t('Every top-up, purchase, refund and adjustment.'), icon: CreditCard },
  { name: 'audit-log', title: t('Audit log'), description: t('Admin and instructor changes for compliance.'), icon: ScrollText },
]

async function download(name: AdminExport) {
  busy.value = name
  try {
    await downloadExport(name, {
      from: name === 'learners' ? undefined : from.value,
      to: name === 'learners' ? undefined : to.value,
      status: name === 'orders' && orderStatus.value !== 'all' ? orderStatus.value : undefined,
    })
  } catch (err) {
    toast.error(t('Export Failed'), getErrorMessage(err, t('Unable to download the export')))
  } finally {
    busy.value = null
  }
}
</script>
