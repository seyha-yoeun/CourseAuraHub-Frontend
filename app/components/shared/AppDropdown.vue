<template>
  <div ref="dropdownRef" class="custom-dropdown">
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
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const match = props.options.find(o => o.value === props.modelValue)
  return match ? match.label : props.placeholder || 'Select...'
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectOption(val: string | number) {
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
}

// Click outside handler
function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
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
}

.dropdown-trigger {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  user-select: none;
}

.dropdown-trigger:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(124, 58, 237, 0.35);
}

.dropdown-trigger.is-open {
  border-color: rgba(124, 58, 237, 0.55);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
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
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
}

.trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-chevron {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.rotate-180 {
  transform: rotate(180deg);
  color: #a78bfa;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #0f101b;
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(124, 58, 237, 0.12);
  min-width: 170px;
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
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.dropdown-item.is-selected {
  background: rgba(124, 58, 237, 0.2);
  color: #c4b5fd;
  font-weight: 600;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  color: rgba(255, 255, 255, 0.45);
}

.check-icon {
  color: #a78bfa;
}

.item-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

/* Dropdown animation */
.dropdown-anim-enter-active,
.dropdown-anim-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
