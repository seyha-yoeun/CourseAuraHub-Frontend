<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6" @click.self="$emit('close')">
        <form
          ref="dialogRef"
          class="w-full max-w-120 rounded-[20px] border bg-[#0f1019] p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] focus:outline-none sm:p-6 light:bg-white light:shadow-xl"
          :class="tone === 'danger' ? 'border-rose-500/25 light:border-rose-200' : 'border-violet-500/25 light:border-violet-500/30'"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @submit.prevent="submit"
        >
          <h3 :id="titleId" class="text-lg leading-tight font-bold text-slate-50 light:text-slate-900">{{ title }}</h3>
          <p v-if="description" class="mt-1.5 text-[13px] leading-relaxed text-white/50 light:text-slate-600">{{ description }}</p>

          <slot />

          <template v-if="showInput">
            <label v-if="label" :for="inputId" class="mt-4 mb-1.5 block text-xs font-semibold text-white/60 light:text-slate-600">{{ label }}</label>
            <textarea
              :id="inputId"
              v-model="value"
              :rows="rows"
              :required="required"
              :maxlength="maxlength"
              :placeholder="placeholder"
              :aria-label="label || title"
              class="w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400"
              :class="label ? '' : 'mt-4'"
            />
          </template>

          <div class="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="w-full cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4.5 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto light:border-slate-200 light:bg-slate-100 light:text-slate-700"
              :disabled="loading"
              @click="$emit('close')"
            >
              {{ t('Cancel') }}
            </button>
            <button
              type="submit"
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-5 py-2.25 text-[13px] font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              :class="tone === 'danger'
                ? 'border-rose-500/40 bg-linear-to-br from-rose-600 to-rose-700 enabled:hover:from-rose-500 enabled:hover:to-rose-600'
                : 'border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 enabled:hover:from-violet-500 enabled:hover:to-indigo-500'"
              :disabled="loading || disabled || (showInput && required && !value.trim())"
            >
              <Loader2 v-if="loading" :size="16" class="animate-spin" />
              <span>{{ confirmLabel || t('Confirm') }}</span>
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useModalA11y } from '~/composables/useModalA11y'

/**
 * A small dialog that asks for an optional or required note before an action: a refund reason,
 * a decline note, a report. The default slot shows extra context above the text box.
 */
const props = withDefaults(defineProps<{
  isOpen: boolean
  title: string
  description?: string
  label?: string
  placeholder?: string
  confirmLabel?: string
  tone?: 'primary' | 'danger'
  required?: boolean
  maxlength?: number
  rows?: number
  initialValue?: string
  loading?: boolean
  disabled?: boolean
  showInput?: boolean
}>(), {
  tone: 'primary',
  required: false,
  maxlength: 1000,
  rows: 3,
  initialValue: '',
  showInput: true,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', value: string): void
}>()

const { t } = useT()
const dialogRef = ref<HTMLElement | null>(null)
const value = ref(props.initialValue)
const id = useId()
const titleId = `prompt-title-${id}`
const inputId = `prompt-input-${id}`

watch(() => props.isOpen, (open) => {
  if (open) value.value = props.initialValue
})

useModalA11y({
  isOpen: computed(() => props.isOpen),
  dialogRef,
  onClose: () => emit('close'),
})

function submit() {
  emit('confirm', value.value.trim())
}

const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0',
}
</script>
