<template>
  <Teleport to="body">
    <Transition v-bind="backdropAnim">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px] light:bg-slate-900/40"
        aria-hidden="true"
        @click="$emit('close')"
      />
    </Transition>

    <Transition v-bind="panelAnim">
      <div v-if="isOpen" class="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- One goal: find help fast. Shortcuts for power users, the help center for everything else. -->
        <div
          ref="dialogRef"
          class="pointer-events-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101814] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] focus:outline-none light:border-slate-200 light:bg-white light:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
          aria-describedby="help-description"
          tabindex="-1"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
            <div>
              <h2 id="help-title" class="text-lg font-semibold tracking-[-0.01em] text-slate-50 light:text-slate-900">{{ t('Help & shortcuts') }}</h2>
              <p id="help-description" class="mt-1 text-[13.5px] text-white/55 light:text-slate-500">{{ t('Move around faster, or get in touch if you\'re stuck.') }}</p>
            </div>
            <button
              type="button"
              class="-mt-1 -mr-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-400 light:hover:bg-slate-100 light:hover:text-slate-700"
              :aria-label="t('Close')"
              @click="$emit('close')"
            >
              <X :size="18" aria-hidden="true" />
            </button>
          </div>

          <!-- Body -->
          <div ref="scrollBodyRef" class="flex-1 overflow-y-auto overscroll-contain px-6 pb-5">
            <h3 class="text-[12px] font-medium text-white/45 light:text-slate-500">{{ t('Keyboard shortcuts') }}</h3>
            <dl class="m-0 mt-2 divide-y divide-white/6 border-y border-white/6 light:divide-slate-100 light:border-slate-100">
              <div v-for="shortcut in shortcuts" :key="shortcut.label" class="flex items-center justify-between gap-4 py-2.5">
                <dt class="text-[13.5px] text-white/80 light:text-slate-700">{{ t(shortcut.label) }}</dt>
                <dd class="m-0 flex shrink-0 items-center gap-1.5 text-[12px] text-white/40 light:text-slate-400">
                  <span class="flex items-center gap-1">
                    <kbd v-for="key in shortcut.keys" :key="key" :class="kbd">{{ key }}</kbd>
                  </span>
                  <template v-if="shortcut.alternative">
                    <span>{{ t('or') }}</span>
                    <kbd :class="kbd">{{ shortcut.alternative }}</kbd>
                  </template>
                </dd>
              </div>
            </dl>
            <p class="mt-2 text-[12px] text-white/40 light:text-slate-500">{{ t('Shortcuts pause while a dialog is open.') }}</p>
          </div>

          <!-- Footer: one primary action -->
          <div class="flex flex-col-reverse gap-2 border-t border-white/8 px-6 py-4 sm:flex-row sm:items-center sm:justify-between light:border-slate-200">
            <nav class="flex justify-center gap-4 text-[12.5px] sm:justify-start" :aria-label="t('Legal')">
              <NuxtLink to="/terms" :class="footerLink" @click="$emit('close')">{{ t('Terms') }}</NuxtLink>
              <NuxtLink to="/privacy" :class="footerLink" @click="$emit('close')">{{ t('Privacy') }}</NuxtLink>
            </nav>
            <NuxtLink
              to="/support"
              class="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-brand-500 px-4 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101814] light:focus-visible:ring-offset-white"
              @click="$emit('close')"
            >
              <LifeBuoy :size="16" aria-hidden="true" />
              {{ t('Visit help center') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { LifeBuoy, X } from 'lucide-vue-next'
import { useModalA11y } from '~/composables/useModalA11y'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useT()
const isOpen = computed(() => props.isOpen)
const dialogRef = ref<HTMLElement | null>(null)
const scrollBodyRef = ref<HTMLElement | null>(null)

// Show the modifier people actually press: ⌘ on Apple devices, Ctrl elsewhere.
const isApple = ref(false)
onMounted(() => {
  isApple.value = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)
})
const mod = computed(() => (isApple.value ? '⌘' : 'Ctrl'))

const shortcuts = computed(() => [
  { label: 'Search', keys: [mod.value, 'K'], alternative: '/' },
  { label: 'Open this help', keys: [mod.value, 'H'], alternative: '?' },
  { label: 'Collapse or expand the sidebar', keys: [mod.value, 'B'] },
  { label: 'Switch light and dark theme', keys: [mod.value, 'Shift', 'L'] },
  { label: 'Close a menu or dialog', keys: ['Esc'] },
])

const kbd = 'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/12 bg-white/5 px-1.5 font-sans text-[12px] font-medium text-white/80 light:border-slate-200 light:bg-slate-50 light:text-slate-700'
const footerLink = 'rounded-sm text-white/50 no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-500 light:hover:text-slate-800'

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

useModalA11y({
  isOpen,
  dialogRef,
  onClose: () => emit('close'),
})

watch(isOpen, async (open) => {
  if (!open) return
  await nextTick()
  scrollBodyRef.value?.scrollTo({ top: 0 })
})
</script>
