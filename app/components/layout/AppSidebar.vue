<template>
  <div>
    <!-- Mobile Backdrop -->
    <Transition v-bind="fadeBackdrop">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
        @click="$emit('close-mobile')"
      />
    </Transition>

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-65 flex-col overflow-hidden border-r border-white/6 bg-zinc-950/95 backdrop-blur-xl transition-[width,transform] duration-300 ease-out max-md:shadow-2xl max-md:shadow-black/70 light:border-slate-200 light:bg-white/98"
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        collapsed ? 'md:w-18' : 'md:w-65'
      ]"
    >
      <!-- Logo -->
      <div class="flex min-h-18 items-center gap-3 border-b border-white/6 px-4.5 py-5 light:border-slate-200">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 9V19L14 26L2 19V9L14 2Z" fill="url(#logoGrad)" />
            <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="rgba(255,255,255,0.15)" />
            <defs>
              <linearGradient id="logoGrad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stop-color="#7c3aed" />
                <stop offset="1" stop-color="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <Transition v-bind="fadeText">
          <div v-if="!collapsed" class="leading-none">
            <span class="block text-sm font-bold tracking-tight text-slate-200 light:text-slate-900">CourseAuraHub</span>
            <span class="mt-0.5 block text-[10px] font-medium tracking-widest text-violet-400 uppercase light:text-violet-700">Academy</span>
          </div>
        </Transition>
      </div>

      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-4">
        <div v-for="section in navSections" :key="section.label" class="mb-2">
          <Transition v-bind="fadeText">
            <p v-if="!collapsed" class="px-2.5 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-white/30 uppercase light:text-slate-400">
              {{ section.label }}
            </p>
          </Transition>
          <NuxtLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="relative flex items-center gap-2.5 overflow-hidden rounded-[10px] border px-3 py-2.5 text-sm font-medium whitespace-nowrap no-underline transition-colors duration-200 ease-out hover:bg-white/5 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:hover:bg-slate-100 light:hover:text-slate-900"
            :class="isActive(item.to)
              ? 'border-violet-500/40 bg-linear-to-br from-violet-600/25 to-blue-600/15 text-violet-300 light:border-violet-500/30 light:bg-violet-500/10 light:text-violet-700'
              : 'border-transparent text-white/55 light:text-slate-600'"
            @click="$emit('close-mobile')"
          >
            <component :is="item.icon" :size="20" class="shrink-0" :stroke-width="1.5" />
            <Transition v-bind="fadeText">
              <span v-if="!collapsed" class="text-sm font-medium">{{ item.label }}</span>
            </Transition>
            <Transition v-bind="fadeText">
              <span
                v-if="!collapsed && item.badge"
                class="ml-auto rounded-full border border-violet-500/30 bg-violet-500/20 px-1.75 py-px text-[10px] font-semibold text-violet-300 light:border-violet-300 light:bg-violet-100 light:text-violet-700"
              >
                {{ item.badge }}
              </span>
            </Transition>
          </NuxtLink>
        </div>
      </nav>

      <!-- Admin Quick Console Trigger -->
      <div v-if="auth.isAdmin" class="border-t border-white/4 p-3 light:border-slate-200">
        <button
          type="button"
          class="flex w-full items-center gap-2.5 overflow-hidden rounded-[10px] border border-violet-500/25 bg-violet-500/12 px-3 py-2.25 text-[13px] font-semibold whitespace-nowrap text-violet-300 transition-colors hover:border-violet-500/50 hover:bg-violet-500/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:border-violet-400 light:hover:bg-violet-100 light:hover:text-violet-900"
          :class="{ 'justify-center px-2.25': collapsed }"
          title="Open Admin Management Console"
          @click="$emit('open-admin')"
        >
          <ShieldAlert :size="18" class="shrink-0 text-violet-400" />
          <Transition v-bind="fadeText">
            <span v-if="!collapsed" class="text-[13px]">Admin Console</span>
          </Transition>
        </button>
      </div>

      <!-- Bottom profile -->
      <div
        class="flex min-h-18 cursor-pointer items-center gap-2.5 border-t border-white/6 px-4.5 py-4 transition-colors hover:bg-white/3 light:border-slate-200 light:hover:bg-slate-50"
        @click="handleProfileClick"
      >
        <img
          :src="auth.userAvatar"
          :alt="`${auth.userName} profile`"
          class="size-9 shrink-0 rounded-full border-2 border-violet-500/40 bg-[#1a1a2e] light:border-violet-300 light:bg-violet-50"
        >
        <Transition v-bind="fadeText">
          <div v-if="!collapsed" class="min-w-0">
            <p class="truncate text-[13px] font-semibold text-slate-200 light:text-slate-900">{{ auth.userName }}</p>
            <p class="mt-px truncate text-[11px] text-white/40 light:text-slate-500">{{ auth.roleLabel }}</p>
          </div>
        </Transition>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  BarChart3,
  GraduationCap,
  ShieldAlert
} from 'lucide-vue-next'

withDefaults(
  defineProps<{
    collapsed: boolean
    mobileOpen?: boolean
  }>(),
  {
    mobileOpen: false
  }
)

const emit = defineEmits(['toggle', 'close-mobile', 'open-admin'])

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const navSections = computed(() => {
  if (!auth.isAdmin) {
    return [
      {
        label: 'Learning',
        items: [
          { to: '/courses', label: 'Courses', icon: BookOpen },
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
      label: 'Management',
      items: [
        { to: '/courses', label: 'Courses', icon: BookOpen },
        { to: '/students', label: 'Students', icon: GraduationCap },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ]
})

const fadeText = {
  enterActiveClass: 'transition-opacity duration-200 ease-out',
  leaveActiveClass: 'transition-opacity duration-200 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const fadeBackdrop = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

function handleProfileClick() {
  if (auth.isAdmin) {
    emit('open-admin')
    return
  }

  router.push('/courses')
}
</script>
