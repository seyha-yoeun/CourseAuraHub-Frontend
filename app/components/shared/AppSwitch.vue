<template>
  <!-- On/off switch. Pass `label` when there is no visible text that names it. -->
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 light:focus-visible:ring-offset-white"
    :class="[modelValue ? 'bg-brand-500' : 'bg-white/15 light:bg-slate-300', busy && 'cursor-wait']"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span
      aria-hidden="true"
      class="absolute left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
      :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
    />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  disabled?: boolean
  // Saving in the background: keeps the switch usable-looking but shows a wait cursor
  busy?: boolean
}>(), {
  label: undefined,
  disabled: false,
  busy: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
