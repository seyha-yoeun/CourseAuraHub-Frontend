<template>
  <div class="flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-[10px] border border-white/10 bg-white/4 p-0.5 light:border-slate-200 light:bg-slate-100" role="radiogroup" :aria-label="t('Filter notifications')">
        <button
          v-for="filter in filters"
          :key="filter.label"
          type="button"
          role="radio"
          :aria-checked="unreadOnly === filter.unreadOnly"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          :class="unreadOnly === filter.unreadOnly
            ? 'bg-white/10 text-slate-50 light:bg-white light:text-slate-900 light:shadow-sm'
            : 'text-white/55 hover:text-white light:text-slate-500 light:hover:text-slate-800'"
          @click="setFilter(filter.unreadOnly)"
        >
          {{ t(filter.label) }}
          <span
            v-if="filter.unreadOnly && unreadCount > 0"
            class="rounded-full bg-brand-500 px-1.5 text-[11px] leading-4.5 font-semibold text-white tabular-nums"
          >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>
      </div>

      <button
        v-if="unreadCount > 0"
        type="button"
        :class="neutralButton"
        :disabled="markingAll"
        @click="markAll"
      >
        <Loader2 v-if="markingAll" :size="15" class="animate-spin" aria-hidden="true" />
        <CheckCheck v-else :size="15" aria-hidden="true" />
        {{ t('Mark all as read') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="!loaded && !loadError" :class="listCard" aria-busy="true" :aria-label="t('Loading notifications')">
      <div v-for="i in 5" :key="i" class="flex items-start gap-3 border-b border-white/6 px-4 py-4 last:border-b-0 sm:px-5 light:border-slate-100">
        <div class="size-9 shrink-0 animate-pulse rounded-[10px] bg-white/6 light:bg-slate-100" />
        <div class="flex-1">
          <div class="h-3.5 w-2/5 animate-pulse rounded bg-white/6 light:bg-slate-100" />
          <div class="mt-2 h-3 w-4/5 animate-pulse rounded bg-white/5 light:bg-slate-100" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="loadError && !items.length" :class="[listCard, 'flex flex-col items-center px-6 py-12 text-center']" role="alert">
      <span class="flex size-11 items-center justify-center rounded-full bg-rose-500/12 text-rose-300 light:bg-negative-bg light:text-negative">
        <AlertCircle :size="20" aria-hidden="true" />
      </span>
      <p class="mt-3 text-[14px] font-semibold text-slate-100 light:text-slate-900">{{ t('Unable to load notifications') }}</p>
      <p class="mt-1 text-[13px] text-white/50 light:text-slate-500">{{ t('Check your connection and try again.') }}</p>
      <button type="button" :class="[neutralButton, 'mt-4']" :disabled="retrying" @click="retry">
        <Loader2 v-if="retrying" :size="15" class="animate-spin" aria-hidden="true" />
        <RotateCw v-else :size="15" aria-hidden="true" />
        {{ t('Try again') }}
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" :class="[listCard, 'flex flex-col items-center px-6 py-14 text-center']">
      <span class="flex size-12 items-center justify-center rounded-full bg-brand-500/12 text-brand-300 light:bg-brand-50 light:text-brand-600">
        <BellOff v-if="unreadOnly" :size="21" aria-hidden="true" />
        <Bell v-else :size="21" aria-hidden="true" />
      </span>
      <p class="mt-3 text-[15px] font-semibold text-slate-100 light:text-slate-900">{{ t('You\'re all caught up') }}</p>
      <p class="mt-1 max-w-80 text-[13px] text-white/50 light:text-slate-500">
        {{ unreadOnly ? t('No unread notifications.') : t('Course updates, certificates, payments and replies will show up here.') }}
      </p>
      <button v-if="unreadOnly" type="button" :class="[neutralButton, 'mt-4']" @click="setFilter(false)">
        {{ t('Show all notifications') }}
      </button>
    </div>

    <!-- List, grouped by day -->
    <div v-else :class="listCard">
      <section v-for="group in groups" :key="group.key" :aria-labelledby="`notif-group-${group.key}`">
        <h2
          :id="`notif-group-${group.key}`"
          class="border-b border-white/6 bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/45 sm:px-5 light:border-slate-100 light:bg-slate-50 light:text-slate-500"
        >
          {{ t(group.label) }}
        </h2>
        <ul class="m-0 list-none p-0">
          <li
            v-for="item in group.items"
            :key="item.id"
            class="group relative flex items-start gap-3 border-b border-white/6 px-4 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-white/[0.03] sm:px-5 light:border-slate-100 light:hover:bg-slate-50"
            :class="!item.read && 'bg-brand-500/[0.06] light:bg-brand-50/60'"
          >
            <!-- Whole-row action: open the notification (marks it read) -->
            <button
              type="button"
              class="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-inset"
              :aria-label="rowLabel(item)"
              @click="open(item)"
            />

            <span
              v-if="!item.read"
              class="absolute top-1/2 left-1.5 size-1.5 -translate-y-1/2 rounded-full bg-brand-500 light:bg-brand-500"
              aria-hidden="true"
            />

            <span
              class="pointer-events-none relative flex size-9 shrink-0 items-center justify-center rounded-[10px]"
              :class="styleFor(item).bgClass"
              aria-hidden="true"
            >
              <component :is="styleFor(item).icon" :size="17" :stroke-width="1.75" :class="styleFor(item).iconClass" />
            </span>

            <div class="pointer-events-none relative min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-3">
                <p class="min-w-0 text-[14px] leading-snug" :class="item.read ? 'font-medium text-slate-200 light:text-slate-700' : 'font-semibold text-slate-50 light:text-slate-900'">
                  {{ t(item.title) }}
                </p>
                <time :datetime="item.createdAt" class="shrink-0 text-[12px] text-white/40 tabular-nums light:text-slate-400" :title="fullDate(item.createdAt)">
                  {{ timeLabel(item.createdAt, group.key) }}
                </time>
              </div>
              <p v-if="item.message" class="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-white/55 light:text-slate-500">{{ item.message }}</p>
              <p class="mt-1.5 flex items-center gap-1.5 text-[12px] text-white/40 light:text-slate-400">
                <span>{{ t(EMAIL_TYPE_LABELS[item.type] ?? 'Notification') }}</span>
                <template v-if="item.link">
                  <span aria-hidden="true">·</span>
                  <span class="inline-flex items-center gap-0.5 font-medium text-brand-300 light:text-brand-600">
                    {{ t('Open') }} <ArrowUpRight :size="12" aria-hidden="true" />
                  </span>
                </template>
              </p>
            </div>

            <!-- Row actions: always visible on touch, revealed on hover/focus with a pointer -->
            <div class="relative z-1 -mr-1.5 flex shrink-0 items-center gap-0.5 self-center transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              <button
                v-if="!item.read"
                type="button"
                :class="iconButton"
                :title="t('Mark as read')"
                :aria-label="`${t('Mark as read')}: ${t(item.title)}`"
                @click="markOne(item)"
              >
                <Check :size="16" aria-hidden="true" />
              </button>
              <button
                type="button"
                :class="[iconButton, 'hover:text-rose-300 light:hover:text-negative']"
                :title="t('Delete')"
                :aria-label="`${t('Delete')}: ${t(item.title)}`"
                :disabled="deletingId === item.id"
                @click="removeOne(item)"
              >
                <Loader2 v-if="deletingId === item.id" :size="15" class="animate-spin" aria-hidden="true" />
                <Trash2 v-else :size="15" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>
      </section>

      <div v-if="hasMore" class="border-t border-white/6 p-2 light:border-slate-100">
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold text-brand-300 transition-colors hover:bg-white/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait light:text-brand-600 light:hover:bg-slate-50"
          :disabled="loadingMore"
          @click="more"
        >
          <Loader2 v-if="loadingMore" :size="15" class="animate-spin" aria-hidden="true" />
          {{ t('Load older notifications') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Loader2,
  RotateCw,
  Trash2,
} from 'lucide-vue-next'
import type { AppNotification } from '~/types'
import { useAppToast } from '~/composables/useAppToast'
import { EMAIL_TYPE_LABELS } from '~/composables/useEmailPreferences'
import { useNotifications } from '~/composables/useNotifications'
import { formatDate, formatTimeAgo } from '~/utils/dateTime'
import { notificationStyles } from '~/utils/notificationStyles'

/** Full notification history. All data goes through useNotifications so the header bell stays in sync. */
const { t } = useT()
const router = useRouter()
const toast = useAppToast()
const center = useNotifications()
const { items, unreadCount, hasMore, unreadOnly, loaded, loadError } = center

const listCard = 'overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03] light:border-slate-200 light:bg-white'
const neutralButton = 'inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/9 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait disabled:opacity-60 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50 light:hover:text-slate-900'
const iconButton = 'flex size-8 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-wait light:text-slate-400 light:hover:bg-slate-100 light:hover:text-slate-800'

const filters = [
  { label: t('All'), unreadOnly: false },
  { label: t('Unread'), unreadOnly: true },
]

const markingAll = ref(false)
const loadingMore = ref(false)
const retrying = ref(false)
const deletingId = ref<number | null>(null)

type GroupKey = 'today' | 'yesterday' | 'week' | 'earlier'
const GROUP_LABELS: Record<GroupKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Earlier this week',
  earlier: 'Older',
}
const DAY_MS = 24 * 60 * 60 * 1000

function groupOf(createdAt: string): GroupKey {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const day = new Date(createdAt)
  day.setHours(0, 0, 0, 0)
  const daysAgo = Math.round((startOfToday.getTime() - day.getTime()) / DAY_MS)
  if (daysAgo <= 0) return 'today'
  if (daysAgo === 1) return 'yesterday'
  if (daysAgo < 7) return 'week'
  return 'earlier'
}

// Items arrive newest first, so groups come out in order too
const groups = computed(() => {
  const result: { key: GroupKey, label: string, items: AppNotification[] }[] = []
  for (const item of items.value) {
    const key = groupOf(item.createdAt)
    let group = result.find(entry => entry.key === key)
    if (!group) {
      group = { key, label: GROUP_LABELS[key], items: [] }
      result.push(group)
    }
    group.items.push(item)
  }
  return result
})

function styleFor(item: AppNotification) {
  return notificationStyles[item.type] ?? notificationStyles.announcement
}

function timeLabel(createdAt: string, group: GroupKey) {
  if (group === 'today') return formatTimeAgo(createdAt)
  const date = new Date(createdAt)
  if (group === 'yesterday') return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (group === 'week') return date.toLocaleDateString('en-US', { weekday: 'short' })
  return formatDate(createdAt)
}

function fullDate(createdAt: string) {
  return new Date(createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function rowLabel(item: AppNotification) {
  const title = t(item.title)
  return item.link ? `${title}. ${t('Open')}` : title
}

async function open(item: AppNotification) {
  center.markRead(item).catch(() => {})
  if (item.link) await router.push(item.link)
}

async function markOne(item: AppNotification) {
  try {
    await center.markRead(item)
  } catch {
    toast.error(t('Notification not updated'), t('Please try again.'))
  }
}

async function removeOne(item: AppNotification) {
  deletingId.value = item.id
  try {
    await center.remove(item)
  } catch {
    toast.error(t('Notification not deleted'), t('Please try again.'))
  } finally {
    deletingId.value = null
  }
}

async function markAll() {
  markingAll.value = true
  try {
    await center.markAllRead()
  } catch {
    toast.error(t('Notifications not updated'), t('Please try again.'))
  } finally {
    markingAll.value = false
  }
}

async function setFilter(value: boolean) {
  try {
    await center.setUnreadOnly(value)
  } catch {
    // loadError drives the error state
  }
}

async function more() {
  loadingMore.value = true
  try {
    await center.loadMore()
  } catch {
    toast.error(t('Notifications not loaded'), t('Please try again.'))
  } finally {
    loadingMore.value = false
  }
}

async function retry() {
  retrying.value = true
  try {
    await center.reload()
  } catch {
    // loadError stays set and the error state remains
  } finally {
    retrying.value = false
  }
}
</script>
