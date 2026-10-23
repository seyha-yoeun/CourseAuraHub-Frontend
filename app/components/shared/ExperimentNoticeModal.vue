<template>
  <Teleport to="body">
    <Transition v-bind="noticeFade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#03040a]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="dismissNotice">
        <div class="relative max-h-[90dvh] w-full max-w-145 overflow-y-auto rounded-3xl border border-violet-500/35 bg-[#0f101a] p-5 pb-5 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_50px_rgba(124,58,237,0.2)] sm:p-7 sm:pb-6 light:border-violet-500/30 light:bg-white light:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.18),0_0_40px_rgba(124,58,237,0.15)]" role="dialog" aria-modal="true" aria-labelledby="notice-title">
          <!-- Ambient Glow decoration -->
          <div class="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.25),transparent_70%)]" />

          <!-- Header badge -->
          <div class="relative mb-4.5 flex flex-wrap items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-violet-500/35 bg-violet-500/16 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-violet-300 uppercase light:border-violet-200 light:bg-violet-50 light:text-violet-700">
              <FlaskConical :size="13" class="text-violet-400" />
              <span>Experimental Platform Sandbox</span>
            </span>
            <span class="inline-flex items-center gap-1.25 rounded-full border border-white/8 bg-white/5 px-2.25 py-1 text-[11px] text-white/50 light:border-slate-200 light:bg-slate-100 light:text-slate-500" title="This notice will be remembered for 30 minutes">
              <Clock :size="12" />
              <span>30m Cache</span>
            </span>
          </div>

          <!-- Header Title -->
          <div class="relative mb-5 flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-violet-500/35 bg-violet-500/18 shadow-[0_0_20px_rgba(124,58,237,0.25)] light:border-violet-200 light:bg-violet-50">
              <Sparkles :size="24" class="text-violet-400" />
            </div>
            <div>
              <h2 id="notice-title" class="text-lg font-bold tracking-tight text-slate-50 sm:text-xl light:text-slate-900">Welcome to CourseAuraHub Academy</h2>
              <p class="mt-0.5 text-[13px] text-white/50 light:text-slate-500">Important visitor information and sandbox usage disclaimer</p>
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

            <!-- Point 3: Safe Simulated Sandbox Data -->
            <div class="flex items-start gap-3.5 rounded-[14px] border border-white/6 bg-white/3 p-3 transition-all hover:border-violet-500/25 hover:bg-white/5 sm:px-3.5 light:border-slate-200 light:bg-slate-50 light:hover:border-violet-300 light:hover:bg-white">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-emerald-500/30 bg-emerald-500/15">
                <Database :size="18" class="text-emerald-400" />
              </div>
              <div class="flex-1">
                <h4 class="text-[13px] leading-snug font-semibold text-slate-100 light:text-slate-900">Simulated Mock Catalog &amp; Live CRUD</h4>
                <p class="mt-0.75 text-xs leading-relaxed text-white/50 light:text-slate-500">
                  Authentication and account/profile settings are connected to the real backend. Courses, pricing figures, revenue charts, and student accounts remain simulated demo data for this phase.
                </p>
              </div>
            </div>
          </div>

          <!-- Expiry Notice Card -->
          <div class="relative mb-5 flex items-center gap-2.5 rounded-[10px] border border-blue-500/20 bg-blue-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-blue-300 light:border-blue-200 light:bg-blue-50 light:text-blue-800">
            <Info :size="15" class="shrink-0 text-blue-400" />
            <span>
              Your acknowledgment is saved in your browser's <strong>localStorage</strong> and will automatically expire in <strong>30 minutes</strong>.
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="relative flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              class="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-3 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              @click="dismissNotice"
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
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  FlaskConical,
  Clock,
  Sparkles,
  ShieldCheck,
  Database,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'

const STORAGE_KEY = 'courseaurahub_experiment_notice'
const EXPIRY_DURATION_MS = 30 * 60 * 1000 // 30 minutes in milliseconds

const isOpen = ref(false)
const router = useRouter()
const route = useRoute()
const { info } = useAppToast()

const noticeFade = {
  enterActiveClass: 'transition duration-250 ease-out',
  leaveActiveClass: 'transition duration-250 ease-out',
  enterFromClass: 'scale-[0.96] opacity-0',
  leaveToClass: 'scale-[0.96] opacity-0'
}

function checkStorageStatus() {
  if (!import.meta.client) return

  // Never interrupt the authentication screens with the notice
  if (route.path.startsWith('/auth')) return

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      isOpen.value = true
      return
    }

    const parsed = JSON.parse(raw)
    const now = Date.now()

    if (!parsed.expiresAt || now > parsed.expiresAt) {
      // Expired!
      isOpen.value = true
    } else {
      isOpen.value = false
    }
  } catch {
    isOpen.value = true
  }
}

function dismissNotice() {
  if (import.meta.client) {
    try {
      const now = Date.now()
      const data = {
        dismissedAt: now,
        expiresAt: now + EXPIRY_DURATION_MS
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Could not write to localStorage:', e)
    }
  }

  isOpen.value = false
  info('Welcome to CourseAuraHub Academy', 'Sandbox session active. Have fun testing!')
}

function exploreCatalog() {
  dismissNotice()
  router.push('/courses')
}

// If the visitor navigates to an auth page while the notice is open, close it
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/auth')) {
      isOpen.value = false
    }
  }
)

onMounted(() => {
  // Give a tiny delay for smooth initial entrance after mount
  setTimeout(() => {
    checkStorageStatus()
  }, 250)
})
</script>
