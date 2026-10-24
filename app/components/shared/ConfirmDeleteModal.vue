<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6" @click.self="$emit('close')">
        <div ref="dialogRef" class="w-full max-w-120 rounded-[20px] border border-rose-500/25 bg-[#0f1019] p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_35px_rgba(244,63,94,0.15)] focus:outline-none sm:p-6 light:border-rose-200 light:bg-white light:shadow-xl" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title" tabindex="-1">
          <div class="mb-4 flex gap-4">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/12 light:border-rose-200 light:bg-rose-50">
              <AlertTriangle :size="24" class="text-rose-400" />
            </div>
            <div>
              <h3 id="confirm-delete-title" class="text-lg leading-tight font-bold text-slate-50 light:text-slate-900">{{ title || 'Confirm Deletion' }}</h3>
              <p class="mt-1.5 text-[13px] leading-relaxed text-white/50 light:text-slate-600">{{ description || 'Are you sure you want to delete this item? This action cannot be undone.' }}</p>
            </div>
          </div>

          <div v-if="itemName" class="my-4 flex flex-col gap-0.5 rounded-[10px] border border-white/6 bg-white/3 px-3.5 py-2.5 light:border-slate-200 light:bg-slate-50">
            <span class="text-[11px] tracking-wider text-white/40 uppercase light:text-slate-500">Selected item:</span>
            <span class="text-sm font-semibold text-slate-200 light:text-slate-800">{{ itemName }}</span>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="w-full cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4.5 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:w-auto light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
              :disabled="loading"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-rose-500/40 bg-linear-to-br from-rose-600 to-rose-700 px-5 py-2.25 text-[13px] font-semibold text-white transition-all enabled:hover:from-rose-500 enabled:hover:to-rose-600 enabled:hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 sm:w-auto"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              <Loader2 v-if="loading" :size="16" class="animate-spin" />
              <span>{{ loading ? 'Deleting...' : 'Delete Permanently' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, Loader2 } from 'lucide-vue-next'
import { useModalA11y } from '~/composables/useModalA11y'

const props = defineProps<{
  isOpen: boolean
  title?: string
  description?: string
  itemName?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close' | 'confirm'): void
}>()

const dialogRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.isOpen)

useModalA11y({
  isOpen,
  dialogRef,
  onClose: () => emit('close')
})

const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}
</script>
