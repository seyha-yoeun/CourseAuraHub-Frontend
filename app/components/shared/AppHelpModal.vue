<template>
  <Teleport to="body">
    <!-- Dimmed backdrop -->
    <Transition v-bind="backdropAnim">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9998] bg-[#03040a]/82 backdrop-blur-xl light:bg-slate-950/45"
        aria-hidden="true"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Help dialog -->
    <Transition v-bind="panelAnim">
      <div
        v-if="isOpen"
        class="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      >
        <div
          ref="dialogRef"
          class="pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-162.5 flex-col overflow-hidden rounded-[22px] border border-violet-500/30 bg-[#0f101b] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_40px_rgba(124,58,237,0.18)] focus:outline-none sm:max-h-[88dvh] light:border-violet-500/25 light:bg-white light:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.15),0_0_35px_rgba(124,58,237,0.12)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
          aria-describedby="help-description"
          tabindex="-1"
        >
          <!-- Top bar -->
          <div class="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 p-4 sm:px-6 sm:py-5 light:border-slate-200">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/35 bg-violet-500/16 shadow-[0_0_18px_rgba(124,58,237,0.16)] light:border-violet-200 light:bg-violet-50">
                <HelpCircle :size="20" class="text-violet-400" />
              </div>
              <div class="min-w-0">
                <h2 id="help-title" class="truncate text-base font-bold text-slate-50 sm:text-[17px] light:text-slate-900">CourseAuraHub Academy Help &amp; Guide</h2>
                <p id="help-description" class="mt-0.5 text-xs text-white/45 light:text-slate-500">Platform overview, system features, and productivity shortcuts</p>
              </div>
            </div>
            <button
              type="button"
              class="group flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition-all duration-200 hover:rotate-6 hover:border-violet-500/35 hover:bg-white/10 hover:text-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-500 light:hover:border-violet-300 light:hover:bg-slate-200 light:hover:text-slate-900"
              aria-label="Close help modal"
              @click="$emit('close')"
            >
              <X :size="18" class="transition-transform duration-200 group-hover:scale-110" />
            </button>
          </div>

          <!-- Body content -->
          <div ref="scrollBodyRef" class="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <!-- App Architecture & Overview -->
            <div>
              <h3 class="mb-2 flex items-center gap-2 text-[13px] font-bold tracking-wider text-slate-200 uppercase light:text-slate-800">
                <Sparkles :size="15" class="text-violet-400" />
                <span>About CourseAuraHub Academy</span>
              </h3>
              <p class="text-[13px] leading-relaxed text-white/60 light:text-slate-600">
                CourseAuraHub is a production-grade online course sales and learning management console. It enables course creators, educators, and administrators to orchestrate course catalogs, monitor learner progress, analyze sales trends, and execute live CRUD operations in real time.
              </p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 transition-all duration-200 hover:border-violet-500/25 hover:bg-white/5 light:border-slate-200 light:bg-slate-50 light:hover:border-violet-200 light:hover:bg-white">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15">
                  <BookOpen :size="16" class="text-violet-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Course Catalog &amp; CRUD</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Create, edit, archive, and publish courses with pricing, difficulty levels, and tags.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 transition-all duration-200 hover:border-blue-500/25 hover:bg-white/5 light:border-slate-200 light:bg-slate-50 light:hover:border-blue-200 light:hover:bg-white">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/15">
                  <GraduationCap :size="16" class="text-blue-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Student Performance</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Track learner completion rates, lifetime spend, enrollment timestamps, and active status.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 transition-all duration-200 hover:border-emerald-500/25 hover:bg-white/5 light:border-slate-200 light:bg-slate-50 light:hover:border-emerald-200 light:hover:bg-white">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15">
                  <BarChart3 :size="16" class="text-emerald-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Live Sales Analytics</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Analyze monthly recurring revenue, course performance charts, and distribution metrics.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 transition-all duration-200 hover:border-purple-500/25 hover:bg-white/5 light:border-slate-200 light:bg-slate-50 light:hover:border-purple-200 light:hover:bg-white">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/15">
                  <ShieldAlert :size="16" class="text-violet-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Admin Console</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Dedicated workspace with KPIs, quick operations, course status toggles, student tools, and seed controls.</p>
                </div>
              </div>
            </div>

            <!-- Keyboard Shortcuts Table -->
            <div>
              <h3 class="mb-2 flex items-center gap-2 text-[13px] font-bold tracking-wider text-slate-200 uppercase light:text-slate-800">
                <Command :size="15" class="text-violet-400" />
                <span>Productivity Keyboard Shortcuts</span>
              </h3>
              <div class="overflow-hidden rounded-xl border border-white/6 bg-white/2 light:border-slate-200 light:bg-slate-50">
                <div
                  v-for="shortcut in shortcuts"
                  :key="shortcut.label"
                  class="flex flex-wrap items-center justify-between gap-2 border-b border-white/4 px-3.5 py-2.5 text-xs transition-colors duration-150 last:border-b-0 hover:bg-white/4 light:border-slate-200 light:hover:bg-white"
                >
                  <span class="font-medium text-white/70 light:text-slate-700">{{ shortcut.label }}</span>
                  <div class="flex items-center gap-1.5">
                    <template v-for="(key, index) in shortcut.keys" :key="`${shortcut.label}-${key}`">
                      <span v-if="index > 0" class="text-white/30 light:text-slate-400">+</span>
                      <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">{{ key }}</kbd>
                    </template>
                    <template v-if="shortcut.alternative">
                      <span class="text-xs text-white/40 light:text-slate-500">or</span>
                      <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">{{ shortcut.alternative }}</kbd>
                    </template>
                  </div>
                </div>
              </div>
              <p class="mt-2 text-[11px] leading-relaxed text-white/35 light:text-slate-500">
                On macOS use <kbd class="rounded border border-white/10 bg-white/5 px-1 py-px font-mono text-[10px] light:border-slate-300 light:bg-white">⌘</kbd> instead of Ctrl. Shortcuts are disabled while a dialog is open.
              </p>
            </div>

            <!-- Tech Stack Badges -->
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 transition-colors hover:border-violet-500/45 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Nuxt 4.5</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 transition-colors hover:border-violet-500/45 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Vue 3.5</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 transition-colors hover:border-violet-500/45 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Nuxt UI 4.11</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 transition-colors hover:border-violet-500/45 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Pinia State</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 transition-colors hover:border-violet-500/45 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Chart.js</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 transition-colors hover:border-violet-500/45 light:border-violet-200 light:bg-violet-50 light:text-violet-700">DiceBear Avatars</span>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/8 bg-black/20 px-4 py-4 sm:px-6 light:border-slate-200 light:bg-slate-50">
            <div class="flex min-w-0 flex-col gap-0.5">
              <span class="text-[11px] text-white/40 light:text-slate-400">Version 2.4.0 (Experimental Showcase)</span>
              <span class="text-[10px] text-white/30 light:text-slate-400">
                Press <kbd class="rounded border border-white/10 bg-white/5 px-1 py-px font-sans text-[9px] light:border-slate-300 light:bg-white">Esc</kbd> or click outside to close
              </span>
            </div>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              @click="$emit('close')"
            >
              <Check :size="15" />
              <span>Got It, Thanks!</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  HelpCircle,
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  BarChart3,
  ShieldAlert,
  Command,
  Check
} from 'lucide-vue-next'
import { useModalA11y } from '~/composables/useModalA11y'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isOpen = computed(() => props.isOpen)
const dialogRef = ref<HTMLElement | null>(null)
const scrollBodyRef = ref<HTMLElement | null>(null)

const shortcuts = [
  { label: 'Focus global search', keys: ['Ctrl / ⌘', 'K'], alternative: '/' },
  { label: 'Open / close help guide', keys: ['Ctrl / ⌘', 'H'], alternative: '?' },
  { label: 'Toggle sidebar', keys: ['Ctrl / ⌘', 'B'] },
  { label: 'Switch theme (dark / light)', keys: ['Ctrl / ⌘', 'Shift', 'L'] },
  { label: 'Close dropdown, modal, or drawer', keys: ['Esc'] }
]

const backdropAnim = {
  enterActiveClass: 'transition-opacity duration-300 ease-out',
  leaveActiveClass: 'transition-opacity duration-200 ease-in',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const panelAnim = {
  enterActiveClass: 'transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
  leaveActiveClass: 'transition duration-200 ease-[cubic-bezier(0.4,0,1,1)] will-change-transform',
  enterFromClass: 'scale-[0.96] translate-y-3 opacity-0',
  leaveToClass: 'scale-[0.98] translate-y-1.5 opacity-0'
}

useModalA11y({
  isOpen,
  dialogRef,
  onClose: () => emit('close')
})

watch(isOpen, async (open) => {
  if (!open) return

  await nextTick()
  scrollBodyRef.value?.scrollTo({ top: 0 })
})
</script>
