<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-3.5 light:border-slate-200">
      <div class="flex min-w-0 items-center gap-2">
        <span class="text-sm font-bold text-slate-100 light:text-slate-900">Notifications</span>
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="scale-75 opacity-0"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="scale-75 opacity-0"
        >
          <span
            v-if="unreadCount > 0"
            class="rounded-full border border-violet-500/35 bg-violet-500/20 px-1.75 py-0.5 text-[10px] font-bold text-violet-300 light:border-violet-200 light:bg-violet-100 light:text-violet-700"
          >
            {{ unreadCount }} new
          </span>
        </Transition>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <button
          v-if="unreadCount > 0"
          type="button"
          class="cursor-pointer rounded-md px-1.5 py-1 text-[11px] font-semibold whitespace-nowrap text-violet-300 transition-colors duration-200 hover:bg-violet-500/15 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-violet-700 light:hover:bg-violet-50 light:hover:text-violet-800"
          @click="$emit('mark-all-read')"
        >
          Mark all read
        </button>
        <button
          type="button"
          class="flex size-7.5 cursor-pointer items-center justify-center rounded-lg text-white/40 transition-all duration-200 hover:bg-white/8 hover:text-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-900"
          aria-label="Close notifications"
          @click="$emit('close')"
        >
          <X :size="14" :stroke-width="2" />
        </button>
      </div>
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
        <span class="text-xs font-semibold text-slate-200 light:text-slate-800">You're all caught up</span>
        <span class="text-[11px] text-white/40 light:text-slate-500">New enrollment activity will show up here.</span>
      </div>

      <button
        v-for="(notif, index) in notifications"
        :key="notif.id"
        type="button"
        class="notification-item-in group relative flex w-full cursor-pointer items-start gap-3 border-b border-white/4 px-4 py-3 text-left transition-colors duration-200 ease-out last:border-b-0 hover:bg-white/4 focus-visible:bg-white/6 focus-visible:outline-none light:border-slate-100 light:hover:bg-slate-50 light:focus-visible:bg-slate-50"
        :class="{ 'bg-violet-500/[0.07] light:bg-violet-50': !notif.read }"
        :style="{ animationDelay: `${Math.min(index, 8) * 35}ms` }"
        @click="$emit('mark-read', notif)"
      >
        <span
          v-if="!notif.read"
          class="absolute top-1/2 left-0 h-7 w-0.5 -translate-y-1/2 rounded-r-full bg-violet-500/80"
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
          <span class="mt-1 block text-[10px] text-white/40 light:text-slate-400">{{ notif.time }}</span>
        </div>

        <span
          v-if="!notif.read"
          class="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-600 shadow-[0_0_6px_rgba(124,58,237,0.7)] light:bg-violet-500"
          aria-label="Unread"
        />
      </button>
    </div>

    <!-- Footer link -->
    <div class="border-t border-white/6 bg-black/20 px-4 py-2.5 text-center light:border-slate-200 light:bg-slate-50">
      <NuxtLink
        to="/analytics"
        class="group inline-flex items-center gap-1 text-[11px] font-semibold text-violet-300 no-underline transition-colors duration-200 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-violet-700 light:hover:text-violet-800"
        @click="$emit('close')"
      >
        <span>View Full Analytics Activity</span>
        <ArrowRight
          :size="12"
          class="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Bell, X } from 'lucide-vue-next'
import type { Component } from 'vue'

interface NotificationItem {
  id: number
  title: string
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
}>()

defineEmits<{
  close: []
  'mark-all-read': []
  'mark-read': [item: NotificationItem]
}>()
</script>
