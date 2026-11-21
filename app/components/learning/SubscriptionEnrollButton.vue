<template>
  <button
    v-if="subscription?.hasAccess"
    type="button"
    class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-400/12 px-4 py-2.5 text-[13px] font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/20 disabled:cursor-wait disabled:opacity-60 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700"
    :disabled="enrolling"
    @click="enroll"
  >
    <Loader2 v-if="enrolling" :size="15" class="animate-spin" />
    <Repeat v-else :size="15" />
    {{ t('Enroll with your subscription') }}
  </button>
  <NuxtLink
    v-else-if="loaded"
    to="/subscription"
    class="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 no-underline hover:text-violet-200 light:text-violet-700 light:hover:text-violet-800"
  >
    <Repeat :size="13" />
    {{ t('Or get every course with a subscription') }}
  </NuxtLink>
</template>

<script setup lang="ts">
import { Loader2, Repeat } from 'lucide-vue-next'
import type { MySubscription } from '~/types/subscription'
import { useAppToast } from '~/composables/useAppToast'
import { useSubscription } from '~/composables/useSubscription'
import { getErrorMessage } from '~/utils/apiError'

/** On a paid course: subscribers enroll for free, everyone else gets a pointer to the plans. */
const props = defineProps<{ slug: string, title: string }>()

const { t } = useT()
const router = useRouter()
const toast = useAppToast()
const { fetchMine, enrollWithSubscription } = useSubscription()

const subscription = ref<MySubscription | null>(null)
const loaded = ref(false)
const enrolling = ref(false)

onMounted(async () => {
  // Extra option on the course page: a failure just leaves the regular purchase buttons
  subscription.value = await fetchMine().catch(() => null)
  loaded.value = true
})

async function enroll() {
  enrolling.value = true
  try {
    await enrollWithSubscription(props.slug)
    toast.success(t('You\'re enrolled'), props.title)
    await router.push(`/learn/${props.slug}`)
  } catch (err) {
    toast.error(t('Enrollment Failed'), getErrorMessage(err, t('Unable to enroll in this course')))
  } finally {
    enrolling.value = false
  }
}
</script>
