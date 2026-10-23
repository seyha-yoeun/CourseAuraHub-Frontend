<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-9999 flex items-center justify-center bg-[#03040a]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="$emit('close')">
        <div class="flex max-h-[88dvh] w-full max-w-162.5 flex-col overflow-hidden rounded-[22px] border border-violet-500/30 bg-[#0f101b] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_40px_rgba(124,58,237,0.18)] light:border-violet-500/25 light:bg-white light:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.15),0_0_35px_rgba(124,58,237,0.12)]" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <!-- Top bar -->
          <div class="flex items-center justify-between gap-3 border-b border-white/8 p-4 sm:px-6 sm:py-5 light:border-slate-200">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/35 bg-violet-500/16 light:border-violet-200 light:bg-violet-50">
                <HelpCircle :size="20" class="text-violet-400" />
              </div>
              <div class="min-w-0">
                <h2 id="help-title" class="truncate text-base font-bold text-slate-50 sm:text-[17px] light:text-slate-900">CourseAuraHub Academy Help &amp; Guide</h2>
                <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">Platform overview, system features, and productivity shortcuts</p>
              </div>
            </div>
            <button
              type="button"
              class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900"
              aria-label="Close help modal"
              @click="$emit('close')"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Body content with tabs/sections -->
          <div class="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-6">
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
              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 light:border-slate-200 light:bg-slate-50">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15">
                  <BookOpen :size="16" class="text-violet-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Course Catalog &amp; CRUD</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Create, edit, archive, and publish courses with pricing, difficulty levels, and tags.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 light:border-slate-200 light:bg-slate-50">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/15">
                  <GraduationCap :size="16" class="text-blue-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Student Performance</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Track learner completion rates, lifetime spend, enrollment timestamps, and active status.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 light:border-slate-200 light:bg-slate-50">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15">
                  <BarChart3 :size="16" class="text-emerald-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Live Sales Analytics</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Analyze monthly recurring revenue, course performance charts, and distribution metrics.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3 light:border-slate-200 light:bg-slate-50">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/15">
                  <ShieldAlert :size="16" class="text-violet-400" />
                </div>
                <div>
                  <h4 class="text-[13px] font-semibold text-slate-100 light:text-slate-900">Admin Quick Console</h4>
                  <p class="mt-0.5 text-[11px] leading-snug text-white/45 light:text-slate-500">Slide-out drawer with one-click course status toggles, student creation, and seed data tools.</p>
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
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/4 px-3.5 py-2.5 text-xs last:border-b-0 light:border-slate-200">
                  <span class="font-medium text-white/70 light:text-slate-700">Focus Global Search</span>
                  <div class="flex items-center gap-1.5">
                    <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">Ctrl</kbd>
                    <span>+</span>
                    <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">K</kbd>
                    <span class="text-xs text-white/40 light:text-slate-500">or</span>
                    <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">/</kbd>
                  </div>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/4 px-3.5 py-2.5 text-xs last:border-b-0 light:border-slate-200">
                  <span class="font-medium text-white/70 light:text-slate-700">Open / Close Help Guide</span>
                  <div class="flex items-center gap-1.5">
                    <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">Ctrl</kbd>
                    <span>+</span>
                    <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">H</kbd>
                  </div>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/4 px-3.5 py-2.5 text-xs last:border-b-0 light:border-slate-200">
                  <span class="font-medium text-white/70 light:text-slate-700">Close Active Dropdown or Modal</span>
                  <div class="flex items-center gap-1.5">
                    <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">Esc</kbd>
                  </div>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-xs light:border-slate-200">
                  <span class="font-medium text-white/70 light:text-slate-700">Toggle Theme (Dark / Light)</span>
                  <div class="flex items-center gap-1.5">
                    <kbd class="rounded-[5px] border border-white/15 bg-white/8 px-1.75 py-0.5 font-mono text-[11px] text-violet-300 shadow-sm light:border-slate-300 light:bg-white light:text-violet-700">Header Toggle Button</kbd>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tech Stack Badges -->
            <div class="flex flex-wrap items-center gap-2 pt-2">
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Nuxt 4.5</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Vue 3.5</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Nuxt UI 4.11</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Pinia State</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">Chart.js</span>
              <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-2.25 py-0.75 text-[11px] font-medium text-violet-300 light:border-violet-200 light:bg-violet-50 light:text-violet-700">DiceBear Avatars</span>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 bg-black/20 px-4 py-4 sm:px-6 light:border-slate-200 light:bg-slate-50">
            <span class="text-[11px] text-white/40 light:text-slate-400">Version 2.4.0 (Experimental Showcase)</span>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-[13px] font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
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

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}
</script>
