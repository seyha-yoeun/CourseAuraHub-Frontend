<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 :class="pageTitle">Organizations</h1>
      <p :class="pageSubtitle">Team accounts for companies and schools. Create one for its owner, then sell it course seats to hand out.</p>
    </div>

    <form :class="cardClass" class="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" @submit.prevent="create">
      <div>
        <label for="org-name" :class="labelClass">Name</label>
        <input id="org-name" v-model="name" type="text" required maxlength="150" placeholder="Acme Training" :class="inputClass">
      </div>
      <div>
        <label for="org-owner" :class="labelClass">Owner email</label>
        <input id="org-owner" v-model="ownerEmail" type="email" required placeholder="owner@acme.com" :class="inputClass">
      </div>
      <button type="submit" :class="primaryButton" :disabled="creating || !name.trim() || !ownerEmail.trim()">
        <Loader2 v-if="creating" :size="15" class="animate-spin" />
        Create
      </button>
    </form>

    <div v-if="pending" class="h-32 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, 'Unable to load organizations') }}</p>
    <p v-else-if="!organizations.length" :class="emptyBox">No organizations yet.</p>
    <div v-else :class="tableWrap">
      <table class="w-full min-w-160 border-collapse text-left text-[13px]">
        <thead>
          <tr :class="headRow">
            <th class="px-4 py-3 font-semibold">Organization</th>
            <th class="px-4 py-3 font-semibold">Members</th>
            <th class="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="organization in organizations" :key="organization.slug">
            <td class="px-4 py-3">
              <span class="font-semibold text-slate-100 light:text-slate-900">{{ organization.name }}</span>
              <span class="block text-xs text-white/45 light:text-slate-500">{{ organization.slug }}</span>
            </td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ organization.members }}</td>
            <td class="px-4 py-3 text-right">
              <button type="button" :class="primaryAction" @click="openSeats(organization)">Set Seats</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="seatsFor" class="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" @click.self="seatsFor = null">
        <form class="w-full max-w-120 rounded-[20px] border border-violet-500/25 bg-[#0f1019] p-5 light:border-violet-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="org-seats-title" @submit.prevent="saveSeats">
          <h2 id="org-seats-title" class="text-lg font-bold text-slate-50 light:text-slate-900">Seats for {{ seatsFor.name }}</h2>
          <p class="mt-1 text-xs text-white/45 light:text-slate-500">The total seats the organization holds for a course. It can't go below the seats already assigned.</p>
          <label for="org-seat-course" :class="labelClass" class="mt-4">Course</label>
          <AppDropdown id="org-seat-course" v-model="seatCourse" :options="courseOptions" placeholder="Choose a course" aria-label="Course" />
          <label for="org-seat-total" :class="labelClass" class="mt-3">Total seats</label>
          <input id="org-seat-total" v-model.number="seatTotal" type="number" min="0" max="100000" required :class="inputClass">
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" :class="neutralAction" @click="seatsFor = null">Cancel</button>
            <button type="submit" :class="primaryAction" :disabled="savingSeats || !seatCourse">Save Seats</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { OrganizationSummary } from '~/types/organization'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useCourseOptions } from '~/composables/useCourseOptions'
import { useOrganizations } from '~/composables/useOrganizations'
import { getErrorMessage } from '~/utils/apiError'
import {
  cardClass, emptyBox, headRow, inputClass, labelClass, neutralAction, pageSubtitle, pageTitle, primaryAction, primaryButton, tableWrap,
} from '~/utils/ui'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Organizations' })

const toast = useAppToast()
const { fetchAllOrganizations, createOrganization, setSeats } = useOrganizations()
const { courseOptions } = await useCourseOptions()

const { data, pending, error, refresh } = await useAsyncData('admin-organizations', fetchAllOrganizations, { server: false })
const organizations = computed(() => data.value ?? [])

const name = ref('')
const ownerEmail = ref('')
const creating = ref(false)

async function create() {
  creating.value = true
  try {
    const created = await createOrganization(name.value.trim(), ownerEmail.value.trim())
    toast.success('Organization Created', created.name)
    name.value = ''
    ownerEmail.value = ''
    await refresh()
  } catch (err) {
    toast.error('Not Created', getErrorMessage(err, 'Unable to create the organization'))
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
    toast.success('Seats Saved', `${seat.courseTitle}: ${seat.used} of ${seat.total} used`)
    seatsFor.value = null
  } catch (err) {
    toast.error('Seats Not Saved', getErrorMessage(err, 'Unable to save seats'))
  } finally {
    savingSeats.value = false
  }
}
</script>
