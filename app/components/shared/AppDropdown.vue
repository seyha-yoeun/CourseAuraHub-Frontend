<template>
  <div
    ref="dropdownRef"
    class="relative z-10 w-full"
    :class="{ 'z-30': isOpen }"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      class="flex h-10.5 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border px-3.5 text-[13px] font-medium transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
      :class="isOpen
        ? 'border-violet-500/70 bg-white/8 text-slate-100 shadow-[0_0_18px_rgba(124,58,237,0.25)] light:border-violet-600 light:bg-white light:text-slate-900 light:shadow-[0_0_15px_rgba(124,58,237,0.15)]'
        : 'border-white/9 bg-white/4 text-slate-200 hover:border-violet-500/40 hover:bg-white/7 light:border-slate-300 light:bg-white light:text-slate-900 light:hover:border-violet-600 light:hover:bg-slate-50'"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <div class="flex min-w-0 items-center gap-2 overflow-hidden">
        <component :is="icon" v-if="icon" :size="15" class="shrink-0 text-white/45 light:text-slate-500" />
        <span class="truncate">{{ selectedLabel }}</span>
      </div>
      <ChevronDown
        :size="15"
        class="shrink-0 text-white/40 transition-transform duration-200 light:text-slate-500"
        :class="{ 'rotate-180 text-violet-300 light:text-violet-700': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition v-bind="dropdownAnim">
      <div v-if="isOpen" class="absolute top-[calc(100%+6px)] right-0 left-0 z-100 min-w-42.5 rounded-xl border border-violet-500/35 bg-zinc-950 p-1.5 shadow-[0_18px_40px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(124,58,237,0.15)] light:border-violet-500/30 light:bg-white light:shadow-[0_18px_40px_-5px_rgba(0,0,0,0.15),0_0_20px_rgba(124,58,237,0.1)]">
        <div class="flex max-h-60 flex-col gap-0.5 overflow-y-auto">
          <button
            v-for="opt in options"
            :key="opt.value"
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-0 px-2.5 py-2 text-left text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            :class="opt.value === modelValue
              ? 'bg-violet-500/25 font-semibold text-violet-300 hover:bg-violet-500/30 light:bg-violet-100 light:text-violet-700 light:hover:bg-violet-200'
              : 'bg-transparent text-white/75 hover:bg-violet-500/15 hover:text-white light:text-slate-700 light:hover:bg-violet-50 light:hover:text-slate-900'"
            @click="selectOption(opt.value)"
          >
            <div class="flex items-center gap-2">
              <component :is="opt.icon" v-if="opt.icon" :size="14" class="text-white/45 light:text-slate-500" />
              <span>{{ opt.label }}</span>
            </div>
            <Check v-if="opt.value === modelValue" :size="14" class="text-violet-300 light:text-violet-700" />
            <span v-else-if="opt.badge" class="rounded-full bg-white/8 px-1.5 py-px text-[10px] text-white/50 light:bg-slate-200 light:text-slate-600">{{ opt.badge }}</span>
          </button>
        </div>
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

const props = defineProps<{
  modelValue: string | number
  options: DropdownOption[]
  icon?: Component
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue' | 'change', val: string | number): void
  (e: 'toggle', open: boolean): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const dropdownAnim = {
  enterActiveClass: 'transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
  leaveActiveClass: 'transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
  enterFromClass: '-translate-y-1.5 scale-[0.98] opacity-0',
  leaveToClass: '-translate-y-1 scale-[0.98] opacity-0'
}

const selectedLabel = computed(() => {
  const match = props.options.find(o => o.value === props.modelValue)
  return match ? match.label : props.placeholder || 'Select...'
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value)
}

function selectOption(val: string | number) {
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
  emit('toggle', false)
}

// Click outside handler
function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    if (isOpen.value) {
      isOpen.value = false
      emit('toggle', false)
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
