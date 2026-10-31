<template>
  <Teleport to="body">
    <!-- Dimmed backdrop -->
    <Transition v-bind="backdropAnim">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9998] bg-[#03040a]/82 backdrop-blur-xl print:hidden light:bg-slate-950/45"
        aria-hidden="true"
        @click="dismissNotice('user')"
      />
    </Transition>

    <!-- Countdown modal -->
    <Transition v-bind="panelAnim">
      <div
        v-if="isOpen"
        class="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 print:hidden"
      >
        <div
          ref="dialogRef"
          class="pointer-events-auto relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-145 flex-col overflow-hidden rounded-3xl border border-violet-500/35 bg-[#0f101a] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_50px_rgba(124,58,237,0.2)] focus:outline-none sm:max-h-[90dvh] light:border-violet-500/30 light:bg-white light:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.18),0_0_40px_rgba(124,58,237,0.15)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-title"
          aria-describedby="notice-description"
          tabindex="-1"
          @pointermove.passive="pauseAutoClose"
          @focusin="handleModalFocusIn"
          @touchstart.passive="pauseAutoClose"
          @wheel.passive="pauseAutoClose"
        >
          <!-- Auto-close progress bar -->
          <div class="relative h-1 shrink-0 overflow-hidden bg-white/8 light:bg-slate-100" aria-hidden="true">
            <div
              class="h-full rounded-r-full bg-linear-to-r from-violet-500 via-fuchsia-400 to-indigo-400 transition-[width,opacity] duration-150 ease-linear"
              :class="{ 'opacity-45': autoClosePaused }"
              :style="{ width: `${countdownProgress}%` }"
            />
          </div>

          <div class="relative flex-1 overflow-y-auto overscroll-contain p-5 pb-5 sm:p-7 sm:pb-6" @scroll.passive="pauseAutoClose">
            <!-- Ambient Glow decoration -->
            <div class="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.25),transparent_70%)]" />

            <!-- Header badge -->
            <div class="relative mb-4.5 flex flex-wrap items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full border border-violet-500/35 bg-violet-500/16 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-violet-300 uppercase light:border-violet-200 light:bg-violet-50 light:text-violet-700">
                <FlaskConical :size="13" class="text-violet-400" />
                <span>Experimental Platform Sandbox</span>
              </span>
              <span
                class="inline-flex items-center gap-1.25 rounded-full border border-violet-500/25 bg-violet-500/10 py-1 pr-2.5 pl-1.5 text-[11px] font-medium text-violet-200 tabular-nums transition-colors duration-300 light:border-violet-200 light:bg-violet-50 light:text-violet-800"
                role="timer"
                aria-live="off"
              >
                <template v-if="autoClosePaused">
                  <Pause :size="12" class="text-violet-400" />
                  <span>Auto-close paused</span>
                </template>
                <template v-else>
                  <svg class="size-4 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
                    <circle
                      cx="10"
                      cy="10"
                      r="7.5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="text-white/15 light:text-violet-200"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="7.5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      class="text-violet-400 transition-[stroke-dashoffset] duration-150 ease-linear"
                      :stroke-dasharray="countdownCircumference"
                      :stroke-dashoffset="countdownOffset"
                    />
                  </svg>
                  <span>Auto-close</span>
                  <span class="font-bold">{{ secondsLeft }}s</span>
                </template>
              </span>
            </div>

            <!-- Header Title -->
            <div class="relative mb-5 flex items-center gap-4">
              <div class="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-violet-500/35 bg-violet-500/18 shadow-[0_0_20px_rgba(124,58,237,0.25)] light:border-violet-200 light:bg-violet-50">
                <Sparkles :size="24" class="text-violet-400" />
              </div>
              <div>
                <h2 id="notice-title" class="text-lg font-bold tracking-tight text-slate-50 sm:text-xl light:text-slate-900">Welcome to CourseAuraHub Academy</h2>
                <p id="notice-description" class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">Important visitor information and sandbox usage disclaimer. This window closes automatically after 7 seconds if left untouched.</p>
              </div>
            </div>

            <!-- Key Notices List -->
            <div class="relative mb-4.5 flex flex-col gap-3">
              <!-- Point 1: Experimental Only -->
              <div class="flex items-start gap-3.5 rounded-[14px] border border-white/6 bg-white/3 p-3 transition-all hover:border-violet-500/25 hover:bg-white/5 sm:px-3.5 light:border-slate-200 light:bg-slate-50 light:hover:border-violet-300 light:hover:bg-white">
                <div class="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-violet-500/30 bg-violet-500/15">
                  <FlaskConical :size="18" class="text-violet-400" />
                </div>
                <div class="flex-1">
                  <h4 class="text-[13px] leading-snug font-semibold text-slate-100 light:text-slate-900">Experimental &amp; Educational Purpose Only</h4>
                  <p class="mt-0.75 text-xs leading-relaxed text-white/50 light:text-slate-500">
                    This web application is an interactive architectural showcase built for experimental evaluation, testing, and modern Nuxt 4 learning. It is not a commercial service.
                  </p>
                </div>
              </div>

              <!-- Point 2: No Advertisements -->
              <div class="flex items-start gap-3.5 rounded-[14px] border border-white/6 bg-white/3 p-3 transition-all hover:border-violet-500/25 hover:bg-white/5 sm:px-3.5 light:border-slate-200 light:bg-slate-50 light:hover:border-violet-300 light:hover:bg-white">
                <div class="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-amber-500/30 bg-amber-500/15">
                  <ShieldCheck :size="18" class="text-amber-400" />
                </div>
                <div class="flex-1">
                  <h4 class="text-[13px] leading-snug font-semibold text-slate-100 light:text-slate-900">Zero Advertisements &amp; Privacy-First</h4>
                  <p class="mt-0.75 text-xs leading-relaxed text-white/50 light:text-slate-500">
                    No commercial advertisements, third-party sponsors, tracking cookies, or marketing banners are provided or supported. Enjoy a clean, distraction-free environment.
                  </p>
                </div>
              </div>

              <!-- Point 3: Live Backend API -->
              <div class="flex items-start gap-3.5 rounded-[14px] border border-white/6 bg-white/3 p-3 transition-all hover:border-violet-500/25 hover:bg-white/5 sm:px-3.5 light:border-slate-200 light:bg-slate-50 light:hover:border-violet-300 light:hover:bg-white">
                <div class="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-emerald-500/30 bg-emerald-500/15">
                  <Database :size="18" class="text-emerald-400" />
                </div>
                <div class="flex-1">
                  <h4 class="text-[13px] leading-snug font-semibold text-slate-100 light:text-slate-900">Live Spring Boot Backend API</h4>
                  <p class="mt-0.75 text-xs leading-relaxed text-white/50 light:text-slate-500">
                    Authentication, platform settings, course catalog management, student records, and analytics are connected to and served live by the real Spring Boot REST API and PostgreSQL database.
                  </p>
                </div>
              </div>
            </div>

            <!-- Expiry Notice Card -->
            <div class="relative mb-5 flex items-center gap-2.5 rounded-[10px] border border-blue-500/20 bg-blue-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-800">
              <Info :size="15" class="shrink-0 text-blue-400" />
              <span>
                Your acknowledgment is saved in your browser's <strong>localStorage</strong> and stays active for <strong>30 minutes</strong>. This window closes automatically after <strong>7 seconds</strong> if you do not interact with it.
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="relative flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                class="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-3 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                @click="dismissNotice('user')"
              >
                <CheckCircle2 :size="16" />
                <span>I Understand &amp; Continue</span>
              </button>

              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center gap-1.75 rounded-xl border border-white/10 bg-white/5 px-4.5 py-3 text-[13px] font-medium text-white/75 transition-all hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200 light:hover:text-slate-900"
                @click="exploreCatalog"
              >
                <BookOpen :size="15" />
                <span>Explore Courses</span>
              </button>
            </div>

            <!-- Dismiss hint -->
            <p class="relative mt-3.5 text-center text-[11px] text-white/30 light:text-slate-400">
              Interact with this window to pause auto-close. Press <kbd class="rounded border border-white/10 bg-white/5 px-1 py-px font-sans text-[10px] light:border-slate-300 light:bg-slate-100">Esc</kbd> or click outside to dismiss.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  FlaskConical,
  Sparkles,
  ShieldCheck,
  Database,
  Info,
  CheckCircle2,
  BookOpen,
  Pause
} from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'
import { useModalA11y } from '~/composables/useModalA11y'

const STORAGE_KEY = 'courseaurahub_experiment_notice'
const EXPIRY_DURATION_MS = 30 * 60 * 1000 // 30 minutes in milliseconds
const AUTO_DISMISS_MS = 7000
const COUNTDOWN_TICK_MS = 100
const RING_RADIUS = 7.5
const countdownCircumference = 2 * Math.PI * RING_RADIUS

const isOpen = ref(false)
const dialogRef = ref<HTMLElement | null>(null)
const remainingMs = ref(AUTO_DISMISS_MS)
const autoClosePaused = ref(false)
const router = useRouter()
const route = useRoute()
const { info } = useAppToast()

let countdownTimer: ReturnType<typeof setInterval> | null = null
let openDelay: ReturnType<typeof setTimeout> | null = null

const secondsLeft = computed(() => Math.max(0, Math.ceil(remainingMs.value / 1000)))
const countdownProgress = computed(() => Math.max(0, Math.min(100, (remainingMs.value / AUTO_DISMISS_MS) * 100)))
const countdownOffset = computed(() => countdownCircumference * (1 - remainingMs.value / AUTO_DISMISS_MS))

const backdropAnim = {
  enterActiveClass: 'transition-opacity duration-300 ease-out',
  leaveActiveClass: 'transition-opacity duration-200 ease-in',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const panelAnim = {
  enterActiveClass: 'transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
  leaveActiveClass: 'transition duration-200 ease-[cubic-bezier(0.4,0,1,1)] will-change-transform',
  enterFromClass: 'scale-[0.94] translate-y-4 opacity-0',
  leaveToClass: 'scale-[0.97] translate-y-2 opacity-0'
}

useModalA11y({
  isOpen,
  dialogRef,
  onClose: () => dismissNotice('user')
})

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startCountdown(fromMs = AUTO_DISMISS_MS) {
  clearCountdown()
  remainingMs.value = fromMs

  let lastTickAt = Date.now()
  countdownTimer = setInterval(() => {
    const now = Date.now()
    remainingMs.value = Math.max(0, remainingMs.value - (now - lastTickAt))
    lastTickAt = now

    if (remainingMs.value <= 0) {
      clearCountdown()
      dismissNotice('auto')
    }
  }, COUNTDOWN_TICK_MS)
}

function pauseAutoClose() {
  if (!isOpen.value || autoClosePaused.value) return

  autoClosePaused.value = true
  clearCountdown()
}

function handleModalFocusIn(event: FocusEvent) {
  if (event.target !== dialogRef.value) {
    pauseAutoClose()
  }
}

function openNotice() {
  autoClosePaused.value = false
  remainingMs.value = AUTO_DISMISS_MS
  isOpen.value = true

  nextTick(() => {
    startCountdown()
  })
}

function saveDismissal() {
  if (!import.meta.client) return

  try {
    const now = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      dismissedAt: now,
      expiresAt: now + EXPIRY_DURATION_MS
    }))
  } catch (e) {
    console.warn('Could not write to localStorage:', e)
  }
}

function dismissNotice(source: 'user' | 'auto' = 'user') {
  if (!isOpen.value) return

  clearCountdown()
  remainingMs.value = 0
  saveDismissal()
  isOpen.value = false

  if (source === 'user') {
    info('Welcome to CourseAuraHub Academy', 'Sandbox session active. Have fun testing!')
  }
}

function exploreCatalog() {
  dismissNotice('user')
  router.push('/courses')
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    pauseAutoClose()
  }
}

function checkStorageStatus() {
  if (!import.meta.client) return

  // Never interrupt the authentication screens with the notice
  if (route.path.startsWith('/auth')) return

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      openNotice()
      return
    }

    const parsed = JSON.parse(raw)
    const now = Date.now()

    if (!parsed.expiresAt || now > parsed.expiresAt) {
      openNotice()
    } else {
      isOpen.value = false
    }
  } catch {
    openNotice()
  }
}

// If the visitor navigates to an auth page while the notice is open, close it
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/auth') && isOpen.value) {
      clearCountdown()
      isOpen.value = false
    }
  }
)

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Give a tiny delay for a smooth initial entrance after mount
  openDelay = setTimeout(() => {
    checkStorageStatus()
  }, 250)
})

onUnmounted(() => {
  if (openDelay) clearTimeout(openDelay)
  clearCountdown()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
