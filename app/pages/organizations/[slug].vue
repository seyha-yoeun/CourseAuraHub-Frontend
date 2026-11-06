<template>
  <div class="flex flex-col gap-5">
    <NuxtLink to="/organizations" class="text-[13px] font-semibold text-violet-300 no-underline light:text-violet-700">{{ t('All organizations') }}</NuxtLink>

    <div v-if="pending" class="h-40 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error || !organization" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load the organization')) }}</p>

    <template v-else>
      <div>
        <h1 :class="pageTitle">{{ organization.name }}</h1>
        <p :class="pageSubtitle" class="capitalize">{{ t(organization.role ?? 'member') }} · {{ t('{count} members', { count: organization.members.length }) }}</p>
      </div>

      <!-- Seats -->
      <section :class="cardClass">
        <h2 :class="sectionTitle">{{ t('Course seats') }}</h2>
        <p v-if="!organization.seats.length" class="mt-2 text-xs text-white/45 light:text-slate-500">{{ t('No seats yet. An admin adds them when your organization buys a course.') }}</p>
        <ul v-else class="m-0 mt-3 flex list-none flex-col gap-3 p-0">
          <li v-for="seat in organization.seats" :key="seat.courseSlug" class="flex flex-wrap items-center gap-3">
            <div class="min-w-0 flex-1">
              <NuxtLink :to="`/courses/${seat.courseSlug}`" class="font-semibold text-slate-100 no-underline hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ seat.courseTitle }}</NuxtLink>
              <div class="mt-1.5 flex items-center gap-2">
                <div class="w-40"><ProgressBar :value="seat.total ? Math.round(seat.used / seat.total * 100) : 0" /></div>
                <span class="text-xs text-white/50 light:text-slate-500">{{ t('{used} of {total} used', { used: seat.used, total: seat.total }) }}</span>
              </div>
            </div>
            <form v-if="canManage && seat.used < seat.total" class="flex items-center gap-2" @submit.prevent="assign(seat)">
              <div class="w-52">
                <AppDropdown v-model="assignees[seat.courseSlug]" :options="memberOptions" :placeholder="t('Choose a member')" size="sm" :aria-label="t('Member to assign')" />
              </div>
              <button type="submit" :class="primaryAction" :disabled="!assignees[seat.courseSlug] || busy">{{ t('Assign') }}</button>
            </form>
          </li>
        </ul>
      </section>

      <!-- Invite -->
      <section v-if="canManage" :class="cardClass">
        <h2 :class="sectionTitle">{{ t('Invite someone') }}</h2>
        <form class="mt-3 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end" @submit.prevent="invite">
          <div>
            <label for="invite-email" :class="labelClass">{{ t('Email') }}</label>
            <input id="invite-email" v-model="inviteEmail" type="email" required :class="inputClass">
          </div>
          <div>
            <label for="invite-role" :class="labelClass">{{ t('Role') }}</label>
            <AppDropdown id="invite-role" v-model="inviteRole" :options="roleOptions" :aria-label="t('Role')" />
          </div>
          <button type="submit" :class="primaryButton" :disabled="busy || !inviteEmail.trim()">{{ t('Send invitation') }}</button>
        </form>
        <div v-if="lastInvite" class="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3 py-2 text-xs text-white/70 light:border-emerald-200 light:bg-emerald-50 light:text-slate-700">
          <span class="min-w-0 flex-1 truncate">{{ t('Invitation emailed to {email}. You can also share the link:', { email: lastInvite.email }) }} <span class="font-mono">{{ lastInvite.inviteUrl }}</span></span>
          <button type="button" :class="neutralAction" @click="copyInvite">{{ t('Copy link') }}</button>
        </div>
      </section>

      <!-- Members -->
      <section :class="cardClass">
        <h2 :class="sectionTitle">{{ t('Members') }}</h2>
        <ul class="m-0 mt-3 flex list-none flex-col divide-y divide-white/6 p-0 light:divide-slate-200">
          <li v-for="member in organization.members" :key="member.userId" class="flex flex-wrap items-center gap-3 py-2.5">
            <div class="min-w-0 flex-1">
              <span class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ member.name }}</span>
              <span class="block text-xs text-white/45 light:text-slate-500">{{ member.email }} · {{ t('Joined {date}', { date: formatDate(member.joinedAt) }) }}</span>
            </div>
            <span class="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold capitalize text-white/65 light:border-slate-200 light:bg-slate-100 light:text-slate-600">{{ t(member.role) }}</span>
            <button
              v-if="canManage && member.role !== 'owner' && member.userId !== auth.user?.userId"
              type="button"
              :class="dangerAction"
              :disabled="busy"
              @click="removing = member"
            >
              {{ t('Remove') }}
            </button>
          </li>
        </ul>
      </section>

      <!-- Progress -->
      <section v-if="canManage" :class="cardClass">
        <h2 :class="sectionTitle">{{ t('Learning progress') }}</h2>
        <p v-if="!progress?.length" class="mt-2 text-xs text-white/45 light:text-slate-500">{{ t('No assigned courses yet.') }}</p>
        <div v-else class="mt-3 overflow-x-auto">
          <table class="w-full min-w-140 border-collapse text-left text-[13px]">
            <thead>
              <tr :class="headRow">
                <th class="px-3 py-2 font-semibold">{{ t('Member') }}</th>
                <th class="px-3 py-2 font-semibold">{{ t('Course') }}</th>
                <th class="px-3 py-2 font-semibold">{{ t('Progress') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/6 light:divide-slate-200">
              <template v-for="member in progress" :key="member.userId">
                <tr v-for="(course, index) in member.courses" :key="`${member.userId}-${course.courseSlug}`">
                  <td class="px-3 py-2 text-slate-100 light:text-slate-900">{{ index === 0 ? member.name : '' }}</td>
                  <td class="px-3 py-2 text-white/70 light:text-slate-600">{{ course.courseTitle }}</td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2">
                      <div class="w-32"><ProgressBar :value="course.totalLessons ? Math.round(course.completedLessons / course.totalLessons * 100) : 0" /></div>
                      <span class="text-xs text-white/50 light:text-slate-500">{{ course.completedLessons }}/{{ course.totalLessons }}</span>
                      <NuxtLink v-if="course.certificateNumber" :to="`/certificates/${course.certificateNumber}`" class="text-xs font-semibold text-emerald-400 no-underline light:text-emerald-700">{{ t('Certificate') }}</NuxtLink>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <ConfirmDeleteModal
      :is-open="Boolean(removing)"
      :title="t('Remove member')"
      :description="t('They leave the organization. Courses they already started stay theirs.')"
      :item-name="removing ? `${removing.name} · ${removing.email}` : undefined"
      :loading="busy"
      @close="removing = null"
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import type { OrganizationInvite, OrganizationMember, OrganizationRole, OrganizationSeat } from '~/types/organization'
import ProgressBar from '~/components/learning/ProgressBar.vue'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useOrganizations } from '~/composables/useOrganizations'
import { getErrorMessage } from '~/utils/apiError'
import { formatDate } from '~/utils/dateTime'
import {
  cardClass, dangerAction, emptyBox, headRow, inputClass, labelClass, neutralAction, pageSubtitle, pageTitle,
  primaryAction, primaryButton, sectionTitle,
} from '~/utils/ui'

const { t } = useT()
const route = useRoute()
const auth = useAuth()
const toast = useAppToast()
const { fetchOrganization, inviteMember, assignSeat, removeMember, fetchMemberProgress } = useOrganizations()
const slug = computed(() => String(route.params.slug))

const { data: organization, pending, error, refresh } = await useAsyncData(
  () => `organization-${slug.value}`,
  () => fetchOrganization(slug.value),
  { server: false, watch: [slug] },
)
useHead({ title: computed(() => organization.value?.name ?? t('Organization')) })

const canManage = computed(() => organization.value?.role === 'owner' || organization.value?.role === 'manager')

const { data: progress, refresh: refreshProgress } = await useAsyncData(
  () => `organization-progress-${slug.value}`,
  () => canManage.value ? fetchMemberProgress(slug.value) : Promise.resolve([]),
  { server: false, watch: [slug, canManage] },
)

const memberOptions = computed(() => (organization.value?.members ?? []).map(member => ({ value: member.userId, label: member.name })))
const roleOptions = computed(() => [
  { value: 'member', label: t('Member') },
  { value: 'manager', label: t('Manager') },
])

const busy = ref(false)
const assignees = reactive<Record<string, string>>({})
const inviteEmail = ref('')
const inviteRole = ref<OrganizationRole>('member')
const lastInvite = ref<OrganizationInvite | null>(null)
const removing = ref<OrganizationMember | null>(null)

async function assign(seat: OrganizationSeat) {
  const userId = assignees[seat.courseSlug]
  if (!userId) return
  busy.value = true
  try {
    await assignSeat(slug.value, seat.courseSlug, userId)
    toast.success(t('Seat assigned'), seat.courseTitle)
    assignees[seat.courseSlug] = ''
    await Promise.all([refresh(), refreshProgress()])
  } catch (err) {
    toast.error(t('Seat not assigned'), getErrorMessage(err, t('Unable to assign the seat')))
  } finally {
    busy.value = false
  }
}

async function invite() {
  busy.value = true
  try {
    lastInvite.value = await inviteMember(slug.value, inviteEmail.value.trim(), inviteRole.value)
    toast.success(t('Invitation sent'), lastInvite.value.email)
    inviteEmail.value = ''
  } catch (err) {
    toast.error(t('Invitation not sent'), getErrorMessage(err, t('Unable to send the invitation')))
  } finally {
    busy.value = false
  }
}

async function copyInvite() {
  if (!lastInvite.value) return
  try {
    await navigator.clipboard.writeText(lastInvite.value.inviteUrl)
    toast.success(t('Link copied'))
  } catch {
    toast.error(t('Could not copy the link'), lastInvite.value.inviteUrl)
  }
}

async function remove() {
  const member = removing.value
  if (!member) return
  busy.value = true
  try {
    await removeMember(slug.value, member.userId)
    toast.info(t('Member removed'), member.name)
    removing.value = null
    await Promise.all([refresh(), refreshProgress()])
  } catch (err) {
    toast.error(t('Member not removed'), getErrorMessage(err, t('Unable to remove the member')))
  } finally {
    busy.value = false
  }
}
</script>
