<template>
  <div
    ref="dropdownRef"
    class="relative w-full"
    :class="isOpen ? 'z-30' : 'z-10'"
    @keydown="handleKeydown"
  >
    <!-- Trigger Button -->
    <button
      :id="id"
      ref="triggerRef"
      type="button"
      class="group/trigger flex w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border px-3.5 text-[13px] font-medium transition-all duration-200 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      :class="[
        size === 'sm' ? 'h-9.5' : 'h-10.5',
        isOpen
          ? 'border-violet-500/70 bg-white/8 text-slate-100 shadow-[0_0_0_3px_rgba(124,58,237,0.15),0_0_18px_rgba(124,58,237,0.22)] light:border-violet-600 light:bg-white light:text-slate-900 light:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]'
          : 'border-white/9 bg-white/4 text-slate-200 hover:border-violet-500/40 hover:bg-white/7 light:border-slate-300 light:bg-white light:text-slate-900 light:hover:border-violet-500 light:hover:bg-slate-50'
      ]"
      :disabled="disabled"
      :aria-label="ariaLabel"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listId"
      @click="toggleDropdown"
    >
      <div class="flex min-w-0 items-center gap-2 overflow-hidden">
        <component
          :is="activeIcon"
          v-if="activeIcon"
          :size="15"
          class="shrink-0 transition-colors duration-200"
          :class="isOpen ? 'text-violet-300 light:text-violet-600' : 'text-white/45 group-hover/trigger:text-violet-300 light:text-slate-500 light:group-hover/trigger:text-violet-600'"
        />
        <Transition
          mode="out-in"
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-1 opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="-translate-y-1 opacity-0"
        >
          <span :key="selectedLabel" class="truncate" :class="{ 'text-white/40 light:text-slate-400': !hasSelection }">
            {{ selectedLabel }}
          </span>
        </Transition>
      </div>
      <ChevronDown
        :size="15"
        class="shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        :class="isOpen ? 'rotate-180 text-violet-300 light:text-violet-700' : 'text-white/40 group-hover/trigger:translate-y-px light:text-slate-500'"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition v-bind="dropdownAnim">
      <div
        v-if="isOpen"
        class="absolute right-0 left-0 z-100 min-w-42.5 overflow-hidden rounded-xl border border-violet-500/35 bg-zinc-950/95 p-1.5 shadow-[0_18px_40px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(124,58,237,0.15)] backdrop-blur-xl light:border-violet-500/25 light:bg-white/95 light:shadow-[0_18px_40px_-5px_rgba(15,23,42,0.18),0_0_20px_rgba(124,58,237,0.08)]"
        :class="openUpward ? 'bottom-[calc(100%+6px)] origin-bottom' : 'top-[calc(100%+6px)] origin-top'"
      >
        <ul
          :id="listId"
          ref="listRef"
          role="listbox"
          :aria-activedescendant="highlighted >= 0 ? optionId(highlighted) : undefined"
          class="m-0 flex max-h-60 list-none flex-col gap-0.5 overflow-y-auto overscroll-contain p-0"
        >
          <li
            v-for="(opt, i) in options"
            :id="optionId(i)"
            :key="opt.value"
            role="option"
            :aria-selected="opt.value === modelValue"
            class="dropdown-item-in relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-[background-color,color,padding] duration-150 ease-out"
            :class="[
              opt.value === modelValue
                ? 'bg-violet-500/22 font-semibold text-violet-200 light:bg-violet-100 light:text-violet-700'
                : highlighted === i
                  ? 'bg-violet-500/14 pl-3.5 text-white light:bg-violet-50 light:text-slate-900'
                  : 'text-white/75 light:text-slate-700'
            ]"
            :style="{ '--i': i }"
            @mouseenter="highlighted = i"
            @mousedown.prevent
            @click="selectOption(opt.value)"
          >
            <span
              aria-hidden="true"
              class="absolute top-1/2 left-0.5 h-3.5 w-0.75 -translate-y-1/2 rounded-full bg-violet-400 transition-all duration-200 ease-out light:bg-violet-600"
              :class="highlighted === i && opt.value !== modelValue ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'"
            />
            <div class="flex min-w-0 items-center gap-2">
              <component :is="opt.icon" v-if="opt.icon" :size="14" class="shrink-0 text-white/45 light:text-slate-500" />
              <span class="truncate">{{ opt.label }}</span>
            </div>
            <Check v-if="opt.value === modelValue" :size="14" class="dropdown-check-in shrink-0 text-violet-300 light:text-violet-700" />
            <span v-else-if="opt.badge" class="shrink-0 rounded-full bg-white/8 px-1.5 py-px text-[10px] text-white/50 light:bg-slate-200 light:text-slate-600">{{ opt.badge }}</span>
          </li>
          <li v-if="options.length === 0" class="px-2.5 py-3 text-center text-xs text-white/40 light:text-slate-500">
            No options available
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Check } from 'lucide-vue-next'
import type { Component } from 'vue'

interface DropdownOption {
  value: string | number
  label: string
  icon?: Component
  badge?: string
}

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: DropdownOption[]
  icon?: Component
  placeholder?: string
  id?: string
  ariaLabel?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}>(), {
  icon: undefined,
  placeholder: undefined,
  id: undefined,
  ariaLabel: undefined,
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  (e: 'update:modelValue' | 'change', val: string | number): void
  (e: 'toggle', open: boolean): void
}>()

const isOpen = ref(false)
const openUpward = ref(false)
const highlighted = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

const uid = useId()
const listId = `dropdown-list-${uid}`
const optionId = (i: number) => `${listId}-opt-${i}`

const dropdownAnim = {
  enterActiveClass: 'transition duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]',
  leaveActiveClass: 'transition duration-150 ease-in',
  enterFromClass: 'scale-95 opacity-0 blur-[2px]',
  leaveToClass: 'scale-[0.97] opacity-0'
}

const selectedOption = computed(() => props.options.find(o => o.value === props.modelValue))
const hasSelection = computed(() => !!selectedOption.value)
const selectedLabel = computed(() => selectedOption.value?.label ?? props.placeholder ?? 'Select...')
const activeIcon = computed(() => props.icon ?? selectedOption.value?.icon)

function setOpen(open: boolean) {
  if (isOpen.value === open) return
  if (open) {
    // Flip upward when the viewport doesn't have room for the menu below.
    const rect = triggerRef.value?.getBoundingClientRect()
    if (rect) {
      const menuHeight = Math.min(props.options.length * 38 + 16, 256)
      openUpward.value = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight
    }
    highlighted.value = Math.max(0, props.options.findIndex(o => o.value === props.modelValue))
  }
  isOpen.value = open
  emit('toggle', open)
  if (open) nextTick(scrollHighlightedIntoView)
}

function toggleDropdown() {
  setOpen(!isOpen.value)
}

function selectOption(val: string | number) {
  emit('update:modelValue', val)
  emit('change', val)
  setOpen(false)
  triggerRef.value?.focus()
}

function scrollHighlightedIntoView() {
  const el = listRef.value?.children[highlighted.value] as HTMLElement | undefined
  el?.scrollIntoView({ block: 'nearest' })
}

function moveHighlight(next: number) {
  const count = props.options.length
  if (!count) return
  highlighted.value = (next + count) % count
  nextTick(scrollHighlightedIntoView)
}

function handleKeydown(e: KeyboardEvent) {
  if (props.disabled) return

  if (!isOpen.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      setOpen(true)
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      moveHighlight(highlighted.value + 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      moveHighlight(highlighted.value - 1)
      break
    case 'Home':
      e.preventDefault()
      moveHighlight(0)
      break
    case 'End':
      e.preventDefault()
      moveHighlight(props.options.length - 1)
      break
    case 'Enter':
    case ' ': {
      e.preventDefault()
      const opt = props.options[highlighted.value]
      if (opt) selectOption(opt.value)
      break
    }
    case 'Escape':
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
      triggerRef.value?.focus()
      break
    case 'Tab':
      setOpen(false)
      break
    default:
      // Type-ahead: jump to the first option starting with the typed character.
      if (e.key.length === 1) {
        const char = e.key.toLowerCase()
        const idx = props.options.findIndex(o => o.label.toLowerCase().startsWith(char))
        if (idx >= 0) moveHighlight(idx)
      }
  }
}

function handleClickOutside(e: MouseEvent) {
  if (isOpen.value && dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    setOpen(false)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
