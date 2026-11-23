<template>
  <!-- Language picker: flag + code on the button, a small menu with each language in its own script. -->
  <div ref="rootRef" class="relative print:hidden" @keydown="onKeydown">
    <button
      ref="triggerRef"
      type="button"
      class="flex h-9 w-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-colors sm:w-auto sm:px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
      :class="open
        ? 'border-brand-500/50 bg-white/8 text-white light:border-brand-500 light:bg-white light:text-slate-900'
        : 'border-white/8 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200 light:hover:text-slate-900'"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="menuId"
      :aria-label="current.switchLabel"
      :title="current.switchLabel"
      @click="toggle()"
    >
      <component :is="current.flag" class="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" />
      <!-- Phones show just the flag; the code and chevron appear from sm up -->
      <span class="hidden sm:inline">{{ current.code }}</span>
      <ChevronDown :size="13" aria-hidden="true" class="hidden opacity-60 transition-transform duration-200 sm:block" :class="open && 'rotate-180'" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      enter-from-class="scale-95 -translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
      leave-to-class="scale-95 -translate-y-1 opacity-0"
    >
      <div
        v-if="open"
        :id="menuId"
        role="menu"
        :aria-label="current.menuLabel"
        class="z-60 origin-top-right rounded-xl border border-white/10 bg-[#101814] p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] light:border-slate-200 light:bg-white light:shadow-[0_16px_40px_-12px_rgba(11,31,23,0.25)] sm:absolute sm:top-[calc(100%+6px)] sm:right-0 sm:w-52"
        :style="menuStyle"
      >
        <button
          v-for="(option, index) in options"
          :key="option.value"
          :ref="el => setItemRef(el, index)"
          type="button"
          role="menuitemradio"
          :aria-checked="locale === option.value"
          :lang="option.value"
          class="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left sm:min-h-0 sm:px-2.5 transition-colors focus-visible:outline-none"
          :class="locale === option.value
            ? 'bg-brand-500/12 text-slate-50 light:bg-brand-50 light:text-slate-900'
            : 'text-white/75 hover:bg-white/6 focus-visible:bg-white/6 light:text-slate-700 light:hover:bg-slate-100 light:focus-visible:bg-slate-100'"
          @click="choose(option.value)"
        >
          <component :is="option.flag" class="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" />
          <span class="min-w-0 flex-1">
            <span class="block text-[13px] font-semibold">{{ option.native }}</span>
            <span class="block text-[11.5px] text-white/45 light:text-slate-500" lang="en">{{ option.english }}</span>
          </span>
          <Check v-if="locale === option.value" :size="15" class="shrink-0 text-brand-300 light:text-brand-600" aria-hidden="true" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'
import { h, type CSSProperties, type ComponentPublicInstance, type FunctionalComponent } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type { Locale } from '~/composables/useT'

const { locale, setLocale } = useT()

// Small inline flags: emoji flags don't render on Windows.
const FlagUS: FunctionalComponent = (_, { attrs }) => h('svg', { ...attrs, viewBox: '0 0 20 14', 'aria-hidden': 'true' }, [
  h('rect', { width: 20, height: 14, fill: '#fff' }),
  // 13 stripes; the 7 red ones are the even rows
  ...[0, 2, 4, 6, 8, 10, 12].map(row => h('rect', { y: row * 14 / 13, width: 20, height: 14 / 13, fill: '#b22234' })),
  h('rect', { width: 8.5, height: 7.5, fill: '#3c3b6e' }),
  ...[[1.5, 1.4], [4.25, 1.4], [7, 1.4], [2.9, 3.75], [5.6, 3.75], [1.5, 6.1], [4.25, 6.1], [7, 6.1]]
    .map(([cx, cy]) => h('circle', { cx, cy, r: 0.55, fill: '#fff' })),
])
FlagUS.inheritAttrs = false

const FlagKH: FunctionalComponent = (_, { attrs }) => h('svg', { ...attrs, viewBox: '0 0 20 14', 'aria-hidden': 'true' }, [
  h('rect', { width: 20, height: 14, fill: '#032ea1' }),
  h('rect', { y: 3.5, width: 20, height: 7, fill: '#e00025' }),
  // Angkor Wat, simplified: base, galleries and three towers
  h('path', {
    fill: '#fff',
    d: 'M5.2 9.6h9.6v.7H5.2zM6 8.6h8v1H6zM6.6 7.4h1.2v1.2H6.6zM12.2 7.4h1.2v1.2h-1.2zM8.6 6.6h2.8v2H8.6zM9.3 4.4h1.4l.3 2.2H9zM9.75 3.7h.5l.25.7h-1zM7 6.2h.6l.3 1.2H6.7zM12.4 6.2h.6l.3 1.2h-1.2z',
  }),
])
FlagKH.inheritAttrs = false

const options: { value: Locale, code: string, native: string, english: string, flag: FunctionalComponent, switchLabel: string, menuLabel: string }[] = [
  { value: 'en', code: 'EN', native: 'English', english: 'English', flag: FlagUS, switchLabel: 'Language: English', menuLabel: 'Choose language' },
  { value: 'km', code: 'ខ្មែរ', native: 'ខ្មែរ', english: 'Khmer', flag: FlagKH, switchLabel: 'ភាសា៖ ខ្មែរ', menuLabel: 'ជ្រើសរើសភាសា' },
]

const current = computed(() => options.find(option => option.value === locale.value) ?? options[0]!)

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const itemRefs: HTMLButtonElement[] = []
const menuId = `language-menu-${useId()}`

function setItemRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLButtonElement) itemRefs[index] = el
}

// Phones: the menu becomes a full-width panel just below the trigger, so it never runs off-screen
const isMobile = useMediaQuery('(max-width: 639px)')
const menuTop = ref(0)
const menuStyle = computed<CSSProperties | undefined>(() => isMobile.value
  ? { position: 'fixed', top: `${menuTop.value}px`, left: '12px', right: '12px' }
  : undefined)

function toggle(force?: boolean) {
  open.value = force ?? !open.value
  if (open.value && triggerRef.value) menuTop.value = triggerRef.value.getBoundingClientRect().bottom + 8
  if (open.value) {
    // Start on the current language
    nextTick(() => itemRefs[options.findIndex(option => option.value === locale.value)]?.focus())
  }
}

function close(returnFocus = true) {
  open.value = false
  if (returnFocus) triggerRef.value?.focus()
}

function choose(value: Locale) {
  setLocale(value)
  close()
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value) {
    if (event.key === 'ArrowDown' && event.target === triggerRef.value) {
      event.preventDefault()
      toggle(true)
    }
    return
  }
  const index = itemRefs.findIndex(item => item === document.activeElement)
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    close()
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    itemRefs[(index + step + options.length) % options.length]?.focus()
  } else if (event.key === 'Tab') {
    close(false)
  }
}

// Close on any click outside
function onDocumentClick(event: MouseEvent) {
  if (open.value && !rootRef.value?.contains(event.target as Node)) close(false)
}

// A rotation or resize would leave the menu misplaced; just close it
function onResize() {
  if (open.value) close(false)
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', onResize)
})
</script>
