<template>
  <div>
    <!-- Mobile Backdrop -->
    <Transition v-bind="fadeBackdrop">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] md:hidden light:bg-slate-900/30"
        @click="$emit('close-mobile')"
      />
    </Transition>

    <!--
      Expand/collapse animates only the width. Every icon keeps the same left offset in both states
      (centred in the 72px rail), so nothing re-centres or jumps; labels fade and the aside clips them.
    -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-65 flex-col overflow-hidden border-r border-white/8 bg-zinc-950 transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none max-md:shadow-2xl max-md:shadow-black/40 light:border-slate-200 light:bg-white"
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        collapsed ? 'md:w-18' : 'md:w-65'
      ]"
    >
      <!-- Logo: 28px mark centred in the rail (21.5px + 14px = rail centre) -->
      <div class="flex h-16 shrink-0 items-center gap-2.5 pl-[21.5px]">
        <AuthLogo class="size-7 shrink-0" />
        <span
          class="text-[14.5px] font-bold tracking-[-0.01em] whitespace-nowrap text-slate-50 transition-opacity light:text-slate-900"
          :class="labelFade"
        >{{ t('CourseAuraHub') }}</span>
      </div>

      <nav class="flex flex-1 flex-col overflow-x-hidden overflow-y-auto px-3 pt-1 pb-4" :aria-label="t('Main navigation')">
        <div
          v-for="(section, sectionIndex) in navSections"
          :key="section.label"
          class="border-t transition-[border-color,margin,padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="rail && sectionIndex > 0
            ? 'mt-2 border-white/8 pt-2 light:border-slate-200'
            : 'mt-1 border-transparent pt-0 first:mt-0'"
        >
          <!-- Group header collapses to zero height on the rail; the section's top border stands in for it -->
          <div
            class="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="rail ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'"
            :inert="rail || undefined"
          >
            <div class="min-h-0 overflow-hidden">
              <button
                v-if="section.items.length > 1"
                type="button"
                class="group/header flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-white/40 uppercase transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-400 light:hover:text-slate-600"
                :aria-expanded="isGroupOpen(section.label)"
                :aria-controls="groupId(section.label)"
                @click="toggleGroup(section.label)"
              >
                <span class="truncate">{{ t(section.label) }}</span>
                <ChevronDown
                  :size="14"
                  aria-hidden="true"
                  class="shrink-0 opacity-70 transition-transform duration-200 group-hover/header:opacity-100"
                  :class="isGroupOpen(section.label) ? 'rotate-0' : '-rotate-90'"
                />
              </button>
              <p v-else class="px-2.5 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-white/40 uppercase light:text-slate-400">
                {{ t(section.label) }}
              </p>
            </div>
          </div>

          <!-- Items: grid-rows trick animates the height; `inert` keeps closed links out of the tab order -->
          <div
            :id="groupId(section.label)"
            class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
            :class="showItems(section) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            :inert="!showItems(section) || undefined"
          >
            <div class="flex min-h-0 flex-col gap-0.5 overflow-hidden">
              <NuxtLink
                v-for="item in section.items"
                :key="item.to"
                :to="item.to"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                :title="rail ? t(item.label) : undefined"
                :class="[
                  rowClass,
                  isActive(item.to)
                    ? 'bg-white/7 text-brand-300 light:bg-brand-50 light:text-brand-600'
                    : 'text-white/65 hover:bg-white/5 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900'
                ]"
                @click="$emit('close-mobile')"
              >
                <component
                  :is="item.icon"
                  :size="17"
                  :stroke-width="1.75"
                  aria-hidden="true"
                  class="shrink-0"
                  :class="isActive(item.to) ? '' : 'text-white/45 group-hover:text-white/80 light:text-slate-500 light:group-hover:text-slate-700'"
                />
                <span class="truncate transition-opacity" :class="labelFade">{{ t(item.label) }}</span>
                <span
                  v-if="item.badge"
                  class="ml-auto rounded-full px-1.75 py-px text-[11px] font-semibold tabular-nums transition-opacity"
                  :class="[
                    labelFade,
                    isActive(item.to)
                      ? 'bg-brand-500/25 text-brand-200 light:bg-brand-100 light:text-brand-700'
                      : 'bg-white/8 text-white/55 light:bg-slate-100 light:text-slate-500'
                  ]"
                >
                  {{ item.badge }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- Sidebar toggle (desktop: collapse to the icon rail; mobile drawer: close). Ctrl/⌘+B does the same. -->
      <div class="shrink-0 border-t border-white/8 p-3 light:border-slate-200">
        <button
          type="button"
          :class="[rowClass, 'w-full cursor-pointer text-white/55 hover:bg-white/5 hover:text-white light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-900']"
          :aria-label="toggleLabel"
          :aria-expanded="mobileOpen || !collapsed"
          :title="toggleLabel"
          @click="$emit('toggle')"
        >
          <PanelLeft :size="17" :stroke-width="1.75" class="shrink-0" aria-hidden="true" />
          <span class="truncate transition-opacity" :class="labelFade">{{ toggleLabel }}</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronDown,
  PanelLeft,
  LayoutDashboard,
  BookOpen,
  Settings,
  RotateCcw,
  BarChart3,
  Bell,
  Flag,
  ClipboardCheck,
  FolderTree,
  HelpCircle,
  Gift,
  Route,
  Presentation,
  GraduationCap,
  UserPlus,
  FileDown,
  Heart,
  CreditCard,
  Building2,
  Receipt,
  Repeat,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Tag,
  TicketPercent,
  Trophy,
  Video,
  UserCog,
  Wallet,
  Users
} from 'lucide-vue-next'

import type { Component } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import AuthLogo from '~/components/auth/AuthLogo.vue'

const { t } = useT()

const props = withDefaults(
  defineProps<{
    collapsed: boolean
    mobileOpen?: boolean
  }>(),
  {
    mobileOpen: false
  }
)

defineEmits(['toggle', 'close-mobile'])

const route = useRoute()
const auth = useAuth()

interface NavItem {
  to: string
  label: string
  icon: Component
  badge?: string
}

const navSections = computed<{ label: string, items: NavItem[] }[]>(() => {
  if (!auth.isAuthenticated) {
    return [
      {
        label: 'Learning',
        items: [
          { to: '/courses', label: 'Browse Courses', icon: BookOpen },
          { to: '/instructors', label: 'Instructors', icon: Users },
        ],
      },
    ]
  }

  if (!auth.isAdmin) {
    return [
      ...(auth.isInstructor
        ? [{
            label: 'Teaching',
            items: [
              { to: '/instructor', label: 'My Courses', icon: Presentation },
              { to: '/instructor/earnings', label: 'Earnings', icon: Wallet },
              { to: '/instructor/submissions', label: 'Submissions', icon: ClipboardCheck },
              { to: '/questions', label: 'Questions', icon: HelpCircle },
            ],
          }]
        : []),
      {
        label: 'Learning',
        items: [
          { to: '/my-learning', label: 'My Learning', icon: GraduationCap },
          { to: '/courses', label: 'Browse Courses', icon: BookOpen },
          { to: '/instructors', label: 'Instructors', icon: Users },
          { to: '/wishlist', label: 'Wishlist', icon: Heart },
          { to: '/achievements', label: 'Achievements', icon: Trophy },
          { to: '/live-sessions', label: 'Live Sessions', icon: Video },
          { to: '/learning-paths', label: 'Learning Paths', icon: Route },
          { to: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
        ],
      },
      {
        label: 'Purchases',
        items: [
          { to: '/cart', label: 'Cart', icon: ShoppingCart },
          { to: '/orders', label: 'My Orders', icon: Receipt },
          { to: '/member-card', label: 'Member Card', icon: CreditCard },
          { to: '/subscription', label: 'Subscription', icon: Repeat },
        ],
      },
      {
        label: 'Account',
        items: [
          { to: '/account', label: 'Profile', icon: UserCog },
          { to: '/referrals', label: 'Invite Friends', icon: Gift },
          { to: '/account/notifications', label: 'Notifications', icon: Bell },
          { to: '/account/security', label: 'Security', icon: ShieldCheck },
          { to: '/organizations', label: 'Organizations', icon: Building2 },
        ],
      },
    ]
  }

  return [
    {
      label: 'Overview',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'Learning',
      items: [
        { to: '/courses', label: 'Courses', icon: BookOpen },
        { to: '/students', label: 'Students', icon: GraduationCap },
        { to: '/admin/enrollments', label: 'Enrollments', icon: UserPlus },
        { to: '/admin/categories', label: 'Categories', icon: FolderTree },
        { to: '/admin/learning-paths', label: 'Learning Paths', icon: Route },
        { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
      ],
    },
    {
      label: 'Teaching',
      items: [
        { to: '/admin/course-reviews', label: 'Course Reviews', icon: ShieldCheck },
        { to: '/instructor/submissions', label: 'Submissions', icon: ClipboardCheck },
        { to: '/questions', label: 'Questions', icon: HelpCircle },
        { to: '/admin/reports', label: 'Reported Content', icon: Flag },
      ],
    },
    {
      label: 'Sales',
      items: [
        { to: '/admin/orders', label: 'Orders', icon: Receipt },
        { to: '/admin/member-cards', label: 'Member Cards', icon: CreditCard },
        { to: '/admin/subscriptions', label: 'Subscriptions', icon: Repeat },
        { to: '/admin/refund-requests', label: 'Refund Requests', icon: RotateCcw },
        { to: '/admin/payouts', label: 'Payouts', icon: Wallet },
      ],
    },
    {
      label: 'Promotions',
      items: [
        { to: '/admin/discounts', label: 'Discounts', icon: Tag },
        { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
        { to: '/admin/access-codes', label: 'Access Codes', icon: Gift },
        { to: '/admin/referrals', label: 'Referrals', icon: UserPlus },
      ],
    },
    {
      label: 'Platform',
      items: [
        { to: '/admin', label: 'Admin Console', icon: ShieldAlert },
        { to: '/settings', label: 'Settings', icon: Settings },
        { to: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
        { to: '/admin/exports', label: 'CSV Exports', icon: FileDown },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/account/notifications', label: 'Notifications', icon: Bell },
        { to: '/account/security', label: 'Security', icon: ShieldCheck },
      ],
    },
  ]
})

const fadeBackdrop = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

// The icon rail only exists on desktop; on phones the drawer always shows full labels,
// even if the desktop sidebar was left collapsed.
const isDesktop = useMediaQuery('(min-width: 768px)')
const rail = computed(() => props.collapsed && isDesktop.value)

// Shared row geometry: 36px tall, icon at a fixed 15px inset so it sits centred in the 72px rail
// (12px nav padding + 15px + 8.5px half-icon = 35.5px, the rail's centre) in both states.
const rowClass = 'group relative flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-[15px] text-[13.5px] font-medium whitespace-nowrap no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50'

// Labels fade out quickly as the rail closes, and fade in slightly after it starts opening.
const labelFade = computed(() => (rail.value ? 'opacity-0 duration-100' : 'opacity-100 duration-200 delay-100'))

// On the mobile drawer the button closes it; on desktop it collapses/expands the rail.
const toggleLabel = computed(() => {
  if (props.mobileOpen) return t('Close sidebar')
  return props.collapsed ? t('Expand sidebar') : t('Collapse sidebar')
})

// Groups start open. Closing one is remembered per browser; a group re-opens on its own
// when the current page lives inside it, so the active link is never hidden.
const CLOSED_GROUPS_KEY = 'cah:sidebar-closed-groups'
const closedGroups = ref<Set<string>>(new Set())

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(CLOSED_GROUPS_KEY) || '[]')
    if (Array.isArray(saved)) closedGroups.value = new Set(saved.filter(item => typeof item === 'string'))
  } catch {
    // Storage blocked or corrupt: fall back to everything open.
  }
  openActiveGroup()
})

function persistClosedGroups() {
  try {
    localStorage.setItem(CLOSED_GROUPS_KEY, JSON.stringify([...closedGroups.value]))
  } catch {
    // Not critical; the choice just won't survive a reload.
  }
}

function isGroupOpen(label: string) {
  return !closedGroups.value.has(label)
}

function toggleGroup(label: string) {
  const next = new Set(closedGroups.value)
  if (next.has(label)) next.delete(label)
  else next.add(label)
  closedGroups.value = next
  persistClosedGroups()
}

function openActiveGroup() {
  const active = navSections.value.find(section => section.items.some(item => isActive(item.to)))
  if (active && closedGroups.value.has(active.label)) toggleGroup(active.label)
}

watch(() => route.path, openActiveGroup)

// The icon-only rail always lists every item; single-item groups have no toggle.
function showItems(section: { label: string, items: NavItem[] }) {
  return rail.value || section.items.length <= 1 || isGroupOpen(section.label)
}

function groupId(label: string) {
  return `nav-group-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  if (to === '/admin') return route.path === '/admin'
  // Its sibling pages have their own links; a course page belongs to My Courses
  if (to === '/instructor') return route.path === to || route.path.startsWith('/instructor/courses')
  // The lesson player belongs to My Learning
  if (to === '/my-learning' && route.path.startsWith('/learn/')) return true
  // Profile shares its prefix with the other account pages
  if (to === '/account') return route.path === to
  return route.path.startsWith(to)
}

</script>
