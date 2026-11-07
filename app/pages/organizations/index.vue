<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 :class="pageTitle">{{ t('Organizations') }}</h1>
      <p :class="pageSubtitle">{{ t('Teams you belong to. Your organization can give you access to courses.') }}</p>
    </div>

    <div v-if="pending" class="h-28 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" :class="emptyBox">{{ getErrorMessage(error, t('Unable to load your organizations')) }}</p>
    <div v-else-if="!organizations.length" :class="emptyBox">
      <Building2 :size="30" class="mx-auto mb-2 text-violet-300 light:text-violet-700" />
      <p>{{ t('You are not part of an organization. Ask your team owner for an invitation link.') }}</p>
    </div>
    <ul v-else class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
      <li v-for="organization in organizations" :key="organization.slug">
        <NuxtLink :to="`/organizations/${organization.slug}`" :class="cardClass" class="flex items-center gap-3 no-underline transition-colors hover:border-violet-500/40">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/12">
            <Building2 :size="22" class="text-violet-300 light:text-violet-700" />
          </div>
          <div class="min-w-0">
            <h2 :class="sectionTitle" class="truncate">{{ organization.name }}</h2>
            <p class="text-xs text-white/45 capitalize light:text-slate-500">{{ t(organization.role ?? 'member') }} · {{ t('{count} members', { count: organization.members }) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
import { useOrganizations } from '~/composables/useOrganizations'
import { getErrorMessage } from '~/utils/apiError'
import { cardClass, emptyBox, pageSubtitle, pageTitle, sectionTitle } from '~/utils/ui'

const { t } = useT()
useHead({ title: () => t('Organizations') })

const { fetchMyOrganizations } = useOrganizations()
const { data, pending, error } = await useAsyncData('my-organizations', fetchMyOrganizations, { server: false })
const organizations = computed(() => data.value ?? [])
</script>
