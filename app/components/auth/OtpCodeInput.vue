<template>
  <div class="flex justify-between gap-2 max-[380px]:gap-1.5" role="group" :aria-label="label" @paste.prevent="handlePaste">
    <input
      v-for="(_, index) in length"
      :key="index"
      :ref="element => setInputRef(element, index)"
      :value="digits[index]"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      :aria-label="`${label} digit ${index + 1}`"
      :disabled="disabled"
      :class="[
        'h-14 w-full min-w-0 rounded-xl border bg-white/4 text-center text-xl font-bold text-slate-100 outline-none transition-all duration-200 caret-emerald-500 focus:bg-white/[0.07] focus:ring-[3px] disabled:opacity-60 short:h-12 light:bg-white light:text-slate-900',
        invalid
          ? 'border-red-500 ring-[3px] ring-red-500/15 focus:border-red-500 focus:ring-red-500/15'
          : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/15 light:border-slate-200',
      ]"
      @input="handleInput($event, index)"
      @keydown="handleKeydown($event, index)"
      @focus="selectInput(index)"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, type ComponentPublicInstance } from 'vue'

interface Props {
  modelValue: string
  length?: number
  disabled?: boolean
  invalid?: boolean
  autofocus?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  disabled: false,
  invalid: false,
  autofocus: true,
  label: 'Verification code',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [value: string]
}>()

const inputs: HTMLInputElement[] = []

const digits = computed(() => {
  const value = props.modelValue.replace(/\D/g, '').slice(0, props.length)
  return Array.from({ length: props.length }, (_, index) => value[index] || '')
})

function setInputRef(element: Element | ComponentPublicInstance | null, index: number) {
  if (element instanceof HTMLInputElement) inputs[index] = element
}

function focusInput(index: number) {
  const target = inputs[Math.max(0, Math.min(index, props.length - 1))]
  target?.focus()
}

function selectInput(index: number) {
  inputs[index]?.select()
}

function commit(next: string[]) {
  const value = next.join('').slice(0, props.length)
  emit('update:modelValue', value)

  if (value.length === props.length && !next.includes('')) {
    emit('complete', value)
  }
}

function fillFrom(index: number, text: string) {
  const incoming = text.replace(/\D/g, '')
  if (!incoming) return

  const next = [...digits.value]
  let cursor = index

  for (const char of incoming) {
    if (cursor >= props.length) break
    next[cursor] = char
    cursor += 1
  }

  commit(next)
  nextTick(() => focusInput(cursor))
}

function handleInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (!/\d/.test(value)) {
    target.value = digits.value[index] || ''
    return
  }

  fillFrom(index, value)
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace') {
    event.preventDefault()
    const next = [...digits.value]

    if (next[index]) {
      next[index] = ''
      commit(next)
    } else if (index > 0) {
      next[index - 1] = ''
      commit(next)
      focusInput(index - 1)
    }
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focusInput(index - 1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    focusInput(index + 1)
  }
}

function handlePaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text') || ''
  const active = inputs.findIndex(input => input === document.activeElement)
  fillFrom(active >= 0 ? active : 0, text)
}

function focus() {
  const firstEmpty = digits.value.findIndex(digit => !digit)
  focusInput(firstEmpty >= 0 ? firstEmpty : props.length - 1)
}

defineExpose({ focus })

onMounted(() => {
  if (props.autofocus) focus()
})
</script>
