<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-3.5 light:border-slate-200">
      <div class="flex min-w-0 items-center gap-2">
        <span class="text-sm font-bold text-slate-100 light:text-slate-900">{{ t('Notifications') }}</span>
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="scale-75 opacity-0"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="scale-75 opacity-0"
        >
          <span
            v-if="unreadCount > 0"
            class="rounded-full border border-brand-500/35 bg-brand-500/20 px-1.75 py-0.5 text-[10px] font-bold text-brand-300 light:border-brand-200 light:bg-brand-100 light:text-brand-700"
          >
            {{ unreadCount }} new
          </span>
        </Transition>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <button
          v-if="unreadCount > 0"
          type="button"
          class="cursor-pointer rounded-md px-1.5 py-1 text-[11px] font-semibold whitespace-nowrap text-brand-300 transition-colors duration-200 hover:bg-brand-500/15 hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-brand-700 light:hover:bg-brand-50 light:hover:text-brand-800"
          @click="$emit('mark-all-read')"
        >
          {{ t('Mark all read') }}
        </button>
        <button
          type="button"
          class="flex size-7.5 cursor-pointer items-center justify-center rounded-lg text-white/40 transition-all duration-200 hover:bg-white/8 hover:text-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-900"
          :aria-label="t('Close notifications')"
          @click="$emit('close')"
        >
          <X :size="14" :stroke-width="2" />
        </button>
      </div>
    </div>

    <!-- Feed filter -->
    <div class="flex gap-1 border-b border-white/8 px-4 py-2 light:border-slate-200" role="tablist" :aria-label="t('Filter notifications')">
      <button
        v-for="item in filters"
        :key="item.label"
        type="button"
        role="tab"
        :aria-selected="unreadOnly === item.unreadOnly"
        class="cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
        :class="unreadOnly === item.unreadOnly ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white light:text-slate-600 light:hover:text-slate-900'"
        @click="$emit('update:unread-only', item.unreadOnly)"
      >
        {{ t(item.label) }}
      </button>
    </div>

    <!-- Scrollable notification list -->
    <div
      class="flex flex-col overflow-y-auto overscroll-contain"
      :class="mobile ? 'max-h-[min(52dvh,21rem)]' : 'max-h-80'"
    >
      <div
        v-if="notifications.length === 0"
        class="flex flex-col items-center justify-center gap-1 px-6 py-8 text-center"
      >
        <span class="mb-1 flex size-10 items-center justify-center rounded-full border border-white/8 bg-white/4 light:border-slate-200 light:bg-slate-100">
          <Bell :size="18" :stroke-width="1.5" class="text-white/35 light:text-slate-400" />
        </span>
        <span class="text-xs font-semibold text-slate-200 light:text-slate-800">{{ t('You\'re all caught up') }}</span>
        <span class="text-[11px] text-white/40 light:text-slate-500">{{ unreadOnly ? t('No unread notifications.') : t('New activity will show up here.') }}</span>
      </div>

      <div v-for="(notif, index) in notifications" :key="notif.id" class="group/row relative">
      <button
        type="button"
        class="notification-item-in group relative flex w-full cursor-pointer items-start gap-3 border-b border-white/4 px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-white/4 focus-visible:bg-white/6 focus-visible:outline-none light:border-slate-100 light:hover:bg-slate-50 light:focus-visible:bg-slate-50"
        :class="{ 'bg-brand-500/[0.07] light:bg-brand-50': !notif.read }"
        :style="{ animationDelay: `${Math.min(index, 8) * 35}ms` }"
        @click="$emit('mark-read', notif)"
      >
        <span
          v-if="!notif.read"
          class="absolute top-1/2 left-0 h-7 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-500/80"
          aria-hidden="true"
        />

        <div
          class="mt-0.5 flex size-7.5 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-105"
          :class="notif.bgClass"
        >
          <component :is="notif.icon" :size="15" :class="notif.iconClass" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-xs leading-snug font-medium text-slate-200 light:text-slate-800">{{ notif.title }}</p>
          <p v-if="notif.message" class="mt-0.5 text-[11px] leading-snug text-white/50 light:text-slate-500">{{ notif.message }}</p>
          <span class="mt-1 block text-[10px] text-white/40 light:text-slate-400">{{ notif.time }}</span>
        </div>

        <span
          v-if="!notif.read"
          class="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500 light:bg-brand-500"
          :aria-label="t('Unread')"
        />
      </button>
      <button
        v-if="removable"
        type="button"
        class="absolute right-2 bottom-2 flex size-6 cursor-pointer items-center justify-center rounded-md text-white/35 opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-white/8 hover:text-rose-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-slate-400 light:hover:bg-slate-100 light:hover:text-rose-600"
        :aria-label="`Delete notification: ${notif.title}`"
        @click="$emit('remove', notif)"
      >
        <Trash2 :size="13" />
      </button>
      </div>

      <button
        v-if="hasMore"
        type="button"
        class="cursor-pointer px-4 py-2.5 text-[11px] font-semibold text-brand-300 transition-colors hover:bg-white/4 hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-brand-700 light:hover:bg-slate-50"
        @click="$emit('load-more')"
      >
        {{ t('Load older notifications') }}
      </button>
    </div>

    <!-- Footer: full inbox for everyone, analytics for admins -->
    <div class="flex items-center justify-between gap-3 border-t border-white/8 px-4 py-2.5 light:border-slate-200 light:bg-slate-50">
      <NuxtLink
        to="/account/notifications"
        class="group inline-flex items-center gap-1 rounded-sm text-[12px] font-semibold text-brand-300 no-underline transition-colors duration-200 hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-brand-600 light:hover:text-brand-700"
        @click="$emit('close')"
      >
        <span>{{ t('See all notifications') }}</span>
        <ArrowRight :size="12" class="transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
      </NuxtLink>
      <NuxtLink
        v-if="showAnalyticsLink"
        to="/analytics"
        class="rounded-sm text-[12px] font-medium text-white/50 no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:text-slate-500 light:hover:text-slate-800"
        @click="$emit('close')"
      >
        {{ t('Analytics') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Bell, Trash2, X } from 'lucide-vue-next'
import type { Component } from 'vue'

const { t } = useT()

interface NotificationItem {
  id: number
  title: string
  message?: string
  time: string
  icon: Component
  iconClass: string
  bgClass: string
  read: boolean
}

defineProps<{
  notifications: NotificationItem[]
  unreadCount: number
  mobile?: boolean
  removable?: boolean
  hasMore?: boolean
  showAnalyticsLink?: boolean
  // Show only unread notifications
  unreadOnly?: boolean
}>()

const filters = [
  { label: 'All', unreadOnly: false },
  { label: 'Unread', unreadOnly: true },
]

defineEmits<{
  close: []
  'mark-all-read': []
  'mark-read': [item: NotificationItem]
  remove: [item: NotificationItem]
  'load-more': []
  'update:unread-only': [value: boolean]
}>()
</script>
