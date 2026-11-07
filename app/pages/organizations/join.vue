<template>
  <div class="mx-auto flex w-full max-w-120 flex-col items-center gap-3 py-12 text-center">
    <div class="flex size-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/12">
      <Loader2 v-if="joining" :size="26" class="animate-spin text-violet-300" />
      <AlertCircle v-else-if="failure" :size="26" class="text-rose-400" />
      <Building2 v-else :size="26" class="text-violet-300 light:text-violet-700" />
    </div>
    <h1 class="text-xl font-extrabold text-slate-50 light:text-slate-900">
      {{ joining ? t('Joining the organization...') : failure ? t('Invitation not accepted') : t('Organization invitation') }}
    </h1>
    <p v-if="failure" class="text-[13px] text-white/55 light:text-slate-600">{{ failure }}</p>
    <NuxtLink to="/organizations" :class="primaryButton" class="mt-2">{{ t('My organizations') }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Building2, Loader2 } from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'
import { useOrganizations } from '~/composables/useOrganizations'
import { getErrorMessage } from '~/utils/apiError'
import { primaryButton } from '~/utils/ui'

// Invitation emails link here with ?token=; signing in first is handled by the auth middleware
const { t } = useT()
useHead({ title: () => t('Join organization') })

const route = useRoute()
const toast = useAppToast()
const { acceptInvite } = useOrganizations()

const joining = ref(false)
const failure = ref('')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    failure.value = t('This invitation link is missing its token.')
    return
  }
  joining.value = true
  try {
    const organization = await acceptInvite(token)
    toast.success(t('Welcome aboard'), organization.name)
    await navigateTo(`/organizations/${organization.slug}`, { replace: true })
  } catch (err) {
    failure.value = getErrorMessage(err, t('Unable to accept the invitation'))
  } finally {
    joining.value = false
  }
})
</script>
