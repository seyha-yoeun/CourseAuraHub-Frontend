<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 :class="pageTitle">{{ t('Organizations') }}</h1>
      <p :class="pageSubtitle">{{ t('Team accounts for companies and schools. Create one for its owner, then sell it course seats to hand out.') }}</p>
    </div>

    <form :class="cardClass" class="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" @submit.prevent="create">
      <div>
        <label for="org-name" :class="labelClass">{{ t('Name') }}</label>
        <input id="org-name" v-model="name" type="text" required maxlength="150" :placeholder="t('Acme Training')" :class="inputClass">
      </div>
      <div>
        <label for="org-owner" :class="labelClass">{{ t('Owner email') }}</label>
        <input id="org-owner" v-model="ownerEmail" type="email" required placeholder="owner@acme.com" :class="inputClass">
      </div>
      <button type="submit" :class="primaryButton" :disabled="creating || !name.trim() || !ownerEmail.trim()">
        <Loader2 v-if="creating" :size="15" class="animate-spin" />
        {{ t('Create') }}
      </button>
    </form>

    <div v-if="pending" class="h-32 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load organizations')) }}</p>
    <p v-else-if="!organizations.length" :class="emptyBox">{{ t('No organizations yet.') }}</p>
    <DataTableFrame v-else :label="t('Organizations')" :scroll-key="tableScrollKey">
      <table class="w-full min-w-160 border-collapse text-left text-[13px]">
        <thead>
          <tr :class="headRow">
            <th class="px-4 py-3 font-semibold">{{ t('Organization') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Members') }}</th>
            <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="organization in tableItems" :key="organization.slug">
            <td class="px-4 py-3">
              <span class="font-semibold text-slate-100 light:text-slate-900">{{ organization.name }}</span>
              <span class="block text-xs text-white/45 light:text-slate-500">{{ organization.slug }}</span>
            </td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ organization.members }}</td>
            <td class="px-4 py-3 text-right">
              <button type="button" :class="primaryAction" @click="openSeats(organization)">{{ t('Set Seats') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <template #footer>
        <TablePagination v-model:page="tablePage" v-model:page-size="tablePageSize" :total="tableTotal" />
      </template>
    </DataTableFrame>

    <Teleport to="body">
      <div v-if="seatsFor" class="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" @click.self="seatsFor = null">
        <form class="w-full max-w-120 rounded-[20px] border border-brand-500/25 bg-[#101814] p-5 light:border-brand-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="org-seats-title" @submit.prevent="saveSeats">
          <h2 id="org-seats-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ t('Seats for {name}', { name: seatsFor.name }) }}</h2>
          <p class="mt-1 text-xs text-white/45 light:text-slate-500">{{ t('The total seats the organization holds for a course. It can\'t go below the seats already assigned.') }}</p>
          <label for="org-seat-course" :class="labelClass" class="mt-4">{{ t('Course') }}</label>
          <AppDropdown id="org-seat-course" v-model="seatCourse" :options="courseOptions" :placeholder="t('Choose a course')" :aria-label="t('Course')" />
          <label for="org-seat-total" :class="labelClass" class="mt-3">{{ t('Total seats') }}</label>
          <input id="org-seat-total" v-model.number="seatTotal" type="number" min="0" max="100000" required :class="inputClass">
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" :class="neutralAction" @click="seatsFor = null">{{ t('Cancel') }}</button>
            <button type="submit" :class="primaryAction" :disabled="savingSeats || !seatCourse">{{ t('Save Seats') }}</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { useClientPagination } from '~/composables/useClientPagination'
import { Loader2 } from 'lucide-vue-next'
import type { OrganizationSummary } from '~/types/organization'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useCourseOptions } from '~/composables/useCourseOptions'
import { useOrganizations } from '~/composables/useOrganizations'
import { getErrorMessage } from '~/utils/apiError'
import {
  cardClass, emptyBox, headRow, inputClass, labelClass, neutralAction, pageSubtitle, pageTitle, primaryAction, primaryButton,
} from '~/utils/ui'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Organizations') })

const toast = useAppToast()
const { fetchAllOrganizations, createOrganization, setSeats } = useOrganizations()
const { courseOptions } = await useCourseOptions()

const { data, pending, error, refresh } = await useAsyncData('admin-organizations', fetchAllOrganizations, { server: false })
const organizations = computed(() => data.value ?? [])
const { page: tablePage, pageSize: tablePageSize, total: tableTotal, items: tableItems, scrollKey: tableScrollKey } = useClientPagination(organizations)

const name = ref('')
const ownerEmail = ref('')
const creating = ref(false)

async function create() {
  creating.value = true
  try {
    const created = await createOrganization(name.value.trim(), ownerEmail.value.trim())
    toast.success(t('Organization Created'), created.name)
    name.value = ''
    ownerEmail.value = ''
    await refresh()
  } catch (err) {
    toast.error(t('Not Created'), getErrorMessage(err, t('Unable to create the organization')))
  } finally {
    creating.value = false
  }
}

const seatsFor = ref<OrganizationSummary | null>(null)
const seatCourse = ref('')
const seatTotal = ref(10)
const savingSeats = ref(false)

function openSeats(organization: OrganizationSummary) {
  seatsFor.value = organization
  seatCourse.value = ''
  seatTotal.value = 10
}

async function saveSeats() {
  const organization = seatsFor.value
  if (!organization) return
  savingSeats.value = true
  try {
    const seat = await setSeats(organization.slug, seatCourse.value, seatTotal.value)
    toast.success(t('Seats Saved'), `${seat.courseTitle}: ${seat.used} of ${seat.total} used`)
    seatsFor.value = null
  } catch (err) {
    toast.error(t('Seats Not Saved'), getErrorMessage(err, t('Unable to save seats')))
  } finally {
    savingSeats.value = false
  }
}
</script>
