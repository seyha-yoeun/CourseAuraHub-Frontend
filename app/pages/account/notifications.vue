<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <div>
      <h1 :class="pageTitle">{{ t('Notifications') }}</h1>
      <p :class="pageSubtitle">{{ t('Catch up on activity and choose how we reach you.') }}</p>
    </div>

    <!-- Tabs: the active one is kept in ?tab= so links and reloads land on the right view -->
    <div class="flex gap-6 border-b border-white/10 light:border-slate-200" role="tablist" :aria-label="t('Notifications')">
      <button
        v-for="tab in tabs"
        :id="`tab-${tab.id}`"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        class="relative -mb-px inline-flex cursor-pointer items-center gap-2 border-b-2 pb-2.5 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
        :class="activeTab === tab.id
          ? 'border-brand-400 text-slate-50 light:border-brand-500 light:text-slate-900'
          : 'border-transparent text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-800'"
        @click="selectTab(tab.id)"
        @keydown.right.prevent="selectTab(otherTab(tab.id), true)"
        @keydown.left.prevent="selectTab(otherTab(tab.id), true)"
      >
        <component :is="tab.icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
        {{ t(tab.label) }}
        <span
          v-if="tab.id === 'inbox' && unreadCount > 0"
          class="rounded-full bg-brand-500 px-1.5 text-[11px] leading-4.5 font-semibold text-white tabular-nums"
        >{{ unreadCount > 99 ? '99+' : unreadCount }}<span class="sr-only"> {{ t('unread') }}</span></span>
      </button>
    </div>

    <!-- Inbox -->
    <div v-if="activeTab === 'inbox'" id="panel-inbox" role="tabpanel" aria-labelledby="tab-inbox">
      <NotificationInbox />
    </div>

    <!-- Settings -->
    <div v-else id="panel-settings" role="tabpanel" aria-labelledby="tab-settings" class="flex flex-col gap-5">
      <section :class="card" aria-labelledby="channels-title">
        <div class="border-b border-white/8 px-5 py-4 light:border-slate-200">
          <h2 id="channels-title" class="text-[15px] font-semibold text-slate-50 light:text-slate-900">{{ t('Where you get notified') }}</h2>
          <p class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">{{ t('Your inbox always has everything. Add other places to hear about it sooner.') }}</p>
        </div>

        <div class="divide-y divide-white/8 light:divide-slate-200">
          <!-- In-app is always on -->
          <div class="flex items-center gap-3 px-5 py-4">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-500/15 text-brand-300 light:bg-brand-50 light:text-brand-600">
              <Bell :size="17" :stroke-width="1.75" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[14px] font-semibold text-slate-50 light:text-slate-900">{{ t('In the app') }}</p>
              <p class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">{{ t('The bell in the header and this inbox. Always on.') }}</p>
            </div>
            <span class="rounded-full bg-white/6 px-2 py-px text-[11px] font-semibold text-white/55 light:bg-slate-100 light:text-slate-500">{{ t('Always on') }}</span>
          </div>

          <PushNotificationsCard />
          <TelegramCard />

          <!-- Learning reminders -->
          <div class="flex items-center gap-3 px-5 py-4">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/6 text-white/70 light:bg-slate-100 light:text-slate-600">
              <AlarmClock :size="17" :stroke-width="1.75" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1">
              <p id="reminders-label" class="text-[14px] font-semibold text-slate-50 light:text-slate-900">{{ t('Learning reminders') }}</p>
              <p class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">{{ t('Get a nudge when you haven\'t continued a course for a while.') }}</p>
            </div>
            <AppSwitch
              :model-value="remindersOn"
              :label="t('Learning reminders')"
              :busy="savingReminders"
              @update:model-value="saveReminders"
            />
          </div>
        </div>
      </section>

      <NotificationPreferencesTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlarmClock, Bell, Inbox, SlidersHorizontal } from 'lucide-vue-next'
import TelegramCard from '~/components/account/TelegramCard.vue'
import PushNotificationsCard from '~/components/account/PushNotificationsCard.vue'
import NotificationInbox from '~/components/notifications/NotificationInbox.vue'
import NotificationPreferencesTable from '~/components/notifications/NotificationPreferencesTable.vue'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useNotifications } from '~/composables/useNotifications'
import { getErrorMessage } from '~/utils/apiError'
import { pageSubtitle, pageTitle } from '~/utils/ui'

const { t } = useT()
const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const { unreadCount } = useNotifications()

useHead({ title: () => t('Notifications') })

const card = 'overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03] light:border-slate-200 light:bg-white'

type TabId = 'inbox' | 'settings'
const tabs = [
  { id: 'inbox' as const, label: 'Inbox', icon: Inbox },
  { id: 'settings' as const, label: 'Settings', icon: SlidersHorizontal },
]

const activeTab = computed<TabId>(() => (route.query.tab === 'settings' ? 'settings' : 'inbox'))

function otherTab(id: TabId): TabId {
  return id === 'inbox' ? 'settings' : 'inbox'
}

function selectTab(id: TabId, focus = false) {
  if (id !== activeTab.value) {
    router.replace({ query: { ...route.query, tab: id === 'inbox' ? undefined : id } })
  }
  if (focus) nextTick(() => document.getElementById(`tab-${id}`)?.focus())
}

const remindersOn = ref(true)
const savingReminders = ref(false)

onMounted(async () => {
  const saved = await $fetch<{ enabled: boolean }>('/api/me/reminders').catch(() => null)
  if (saved) remindersOn.value = saved.enabled
})

async function saveReminders(enabled: boolean) {
  if (savingReminders.value) return
  remindersOn.value = enabled
  savingReminders.value = true
  try {
    await $fetch('/api/me/reminders', { method: 'PUT', body: { enabled } })
  } catch (err) {
    remindersOn.value = !enabled
    toast.error(t('Setting not saved'), getErrorMessage(err, t('Please try again.')))
  } finally {
    savingReminders.value = false
  }
}
</script>
