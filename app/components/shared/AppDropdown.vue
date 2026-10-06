<template>
  <div
    ref="dropdownRef"
    class="custom-dropdown"
    :class="{ 'is-open': isOpen }"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      class="dropdown-trigger"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <div class="trigger-content">
        <component :is="icon" v-if="icon" :size="15" class="trigger-icon" />
        <span class="trigger-label">{{ selectedLabel }}</span>
      </div>
      <ChevronDown :size="15" class="trigger-chevron" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown-anim">
      <div v-if="isOpen" class="dropdown-menu glass">
        <div class="menu-scroll">
          <button
            v-for="opt in options"
            :key="opt.value"
            type="button"
            class="dropdown-item"
            :class="{ 'is-selected': opt.value === modelValue }"
            @click="selectOption(opt.value)"
          >
            <div class="item-left">
              <component :is="opt.icon" v-if="opt.icon" :size="14" class="item-icon" />
              <span>{{ opt.label }}</span>
            </div>
            <Check v-if="opt.value === modelValue" :size="14" class="check-icon" />
            <span v-else-if="opt.badge" class="item-badge">{{ opt.badge }}</span>
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
  (e: 'update:modelValue', val: string | number): void
  (e: 'change', val: string | number): void
  (e: 'toggle', open: boolean): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

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

<style scoped>
.custom-dropdown {
  position: relative;
  width: 100%;
  z-index: 10;
}

.custom-dropdown.is-open {
  z-index: 90;
}

.dropdown-trigger {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: var(--bg-input, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.09));
  border-radius: 10px;
  color: var(--text-primary, #e2e8f0);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  user-select: none;
}

html.light .dropdown-trigger {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.dropdown-trigger:hover {
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.07));
  border-color: rgba(124, 58, 237, 0.4);
}

html.light .dropdown-trigger:hover {
  background: #f8fafc;
  border-color: #7c3aed;
}

.dropdown-trigger.is-open {
  border-color: rgba(124, 58, 237, 0.7);
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.08));
  box-shadow: 0 0 18px rgba(124, 58, 237, 0.25);
}

html.light .dropdown-trigger.is-open {
  border-color: #7c3aed;
  background: #ffffff;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.15);
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-icon {
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
  flex-shrink: 0;
}

html.light .trigger-icon {
  color: #64748b;
}

.trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-chevron {
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

html.light .trigger-chevron {
  color: #64748b;
}

.rotate-180 {
  transform: rotate(180deg);
  color: #a78bfa;
}

html.light .rotate-180 {
  color: #7c3aed;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #0f101b;
  border: 1px solid rgba(124, 58, 237, 0.35);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 18px 40px -5px rgba(0, 0, 0, 0.8), 0 0 25px rgba(124, 58, 237, 0.15);
  min-width: 170px;
}

html.light .dropdown-menu {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 18px 40px -5px rgba(0, 0, 0, 0.15), 0 0 20px rgba(124, 58, 237, 0.1);
}

.menu-scroll {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background: none;
  border: none;
  color: var(--text-secondary, rgba(255, 255, 255, 0.75));
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-align: left;
}

html.light .dropdown-item {
  color: #334155;
}

.dropdown-item:hover {
  background: rgba(124, 58, 237, 0.15);
  color: var(--text-primary, #ffffff);
}

html.light .dropdown-item:hover {
  background: #f5f3ff;
  color: #0f172a;
}

.dropdown-item.is-selected {
  background: rgba(124, 58, 237, 0.25);
  color: #c4b5fd;
  font-weight: 600;
}

html.light .dropdown-item.is-selected {
  background: #ede9fe;
  color: #6d28d9;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
}

.check-icon {
  color: #a78bfa;
}

html.light .check-icon {
  color: #7c3aed;
}

.item-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted, rgba(255, 255, 255, 0.5));
}

html.light .item-badge {
  background: #e2e8f0;
  color: #64748b;
}

/* Dropdown animation */
.dropdown-anim-enter-active,
.dropdown-anim-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-anim-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
