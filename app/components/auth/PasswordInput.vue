<template>
  <div class="relative">
    <input
      :id="id"
      ref="inputEl"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      :class="[invalid ? authInputError : authInput, 'pr-[78px]']"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :aria-describedby="describedby"
      required
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="button"
      class="absolute inset-y-1.5 right-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] font-medium text-white/55 transition-colors hover:bg-white/6 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:cursor-not-allowed light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-800"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :aria-pressed="visible"
      :aria-controls="id"
      :disabled="disabled"
      @click="visible = !visible"
    >
      <EyeOff v-if="visible" :size="15" aria-hidden="true" />
      <Eye v-else :size="15" aria-hidden="true" />
      <span aria-hidden="true">{{ visible ? 'Hide' : 'Show' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { authInput, authInputError } from '~/utils/authUi'

withDefaults(defineProps<{
  modelValue: string
  id: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  invalid?: boolean
  describedby?: string
}>(), {
  placeholder: '',
  autocomplete: 'current-password',
  disabled: false,
  invalid: false,
  describedby: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const visible = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

defineExpose({ focus: () => inputEl.value?.focus() })
</script>
