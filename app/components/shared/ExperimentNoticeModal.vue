<template>
  <Teleport to="body">
    <Transition v-bind="backdropAnim">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px] print:hidden light:bg-slate-900/40"
        aria-hidden="true"
        @click="dismiss"
      />
    </Transition>

    <Transition v-bind="panelAnim">
      <div v-if="isOpen" class="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4 print:hidden">
        <!--
          One goal: tell first-time visitors this is a demo, then get out of the way.
          No auto-close timer: people read at their own pace (WCAG 2.2.1).
        -->
        <div
          ref="dialogRef"
          class="pointer-events-auto w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#101814] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] focus:outline-none light:border-slate-200 light:bg-white light:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-title"
          aria-describedby="notice-description"
          tabindex="-1"
        >
          <span class="flex size-10 items-center justify-center rounded-[10px] bg-brand-500/15 text-brand-300 light:bg-brand-50 light:text-brand-600" aria-hidden="true">
            <FlaskConical :size="19" :stroke-width="1.75" />
          </span>

          <h2 id="notice-title" class="mt-4 text-lg font-semibold tracking-[-0.01em] text-slate-50 light:text-slate-900">
            {{ t('This is a demo project') }}
          </h2>
          <p id="notice-description" class="mt-1.5 text-[14px] leading-relaxed text-white/60 light:text-slate-600">
            {{ t('CourseAuraHub is a learning project, not a commercial service. Feel free to look around and try every feature.') }}
          </p>

          <ul class="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
            <li v-for="point in points" :key="point" class="flex items-start gap-2.5 text-[13.5px] leading-snug text-white/75 light:text-slate-700">
              <Check :size="16" :stroke-width="2" class="mt-px shrink-0 text-brand-300 light:text-brand-600" aria-hidden="true" />
              <span>{{ t(point) }}</span>
            </li>
          </ul>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center rounded-[10px] px-4 text-[14px] font-medium text-white/70 transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900"
              @click="browseCourses"
            >
              {{ t('Browse courses') }}
            </button>
            <button
              ref="primaryRef"
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center rounded-[10px] bg-brand-500 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101814] light:focus-visible:ring-offset-white"
              @click="dismiss"
            >
              {{ t('Got it') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Check, FlaskConical } from 'lucide-vue-next'
import { useModalA11y } from '~/composables/useModalA11y'

const STORAGE_KEY = 'courseaurahub_experiment_notice'
// Shown once, then remembered for a month: often enough to inform, rarely enough not to nag.
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000

const { t } = useT()
const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const dialogRef = ref<HTMLElement | null>(null)
const primaryRef = ref<HTMLButtonElement | null>(null)
let openDelay: ReturnType<typeof setTimeout> | null = null

const points = [
  'Built for learning and testing, not for sale',
  'No ads and no tracking cookies',
  'What you add is saved to a live server, so avoid sensitive personal details',
]

const backdropAnim = {
  enterActiveClass: 'transition-opacity duration-200 ease-out',
  leaveActiveClass: 'transition-opacity duration-150 ease-in',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0',
}

const panelAnim = {
  enterActiveClass: 'transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
  leaveActiveClass: 'transition duration-150 ease-in motion-reduce:transition-none',
  enterFromClass: 'scale-[0.98] opacity-0',
  leaveToClass: 'scale-[0.98] opacity-0',
}

useModalA11y({ isOpen, dialogRef, onClose: dismiss })

// Start on the main action, so Enter or Space dismisses straight away. Registered after
// useModalA11y with the same 'post' flush, so it runs after that composable focuses the dialog.
watch(isOpen, async (open) => {
  if (!open) return
  await nextTick()
  primaryRef.value?.focus({ preventScroll: true })
}, { flush: 'post' })

function remember() {
  try {
    const now = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: now, expiresAt: now + REMEMBER_MS }))
  } catch {
    // Storage blocked: the notice may show again next visit, which is harmless.
  }
}

function dismiss() {
  if (!isOpen.value) return
  remember()
  isOpen.value = false
}

function browseCourses() {
  dismiss()
  router.push('/courses')
}

function shouldShow() {
  // Never interrupt the sign-in screens.
  if (route.path.startsWith('/auth')) return false
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return !saved?.expiresAt || Date.now() > saved.expiresAt
  } catch {
    return true
  }
}

// Navigating to an auth page closes it without counting as "seen".
watch(() => route.path, (path) => {
  if (path.startsWith('/auth')) isOpen.value = false
})

onMounted(() => {
  // A short delay lets the page paint first, so the notice doesn't fight the initial render.
  openDelay = setTimeout(() => {
    if (shouldShow()) isOpen.value = true
  }, 400)
})

onUnmounted(() => {
  if (openDelay) clearTimeout(openDelay)
})
</script>
