<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-[#05050c]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="$emit('close')">
        <div ref="dialogRef" class="max-h-[90dvh] w-full max-w-130 overflow-y-auto overscroll-contain rounded-[20px] border border-violet-500/25 bg-[#0f1019] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] focus:outline-none sm:p-6 light:border-violet-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="discount-modal-title" tabindex="-1">
          <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4.5 light:border-slate-200">
            <div>
              <h2 id="discount-modal-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ discount ? 'Edit Discount' : 'New Discount' }}</h2>
              <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ discount ? discount.courseTitle : 'Learners see the sale price automatically, with no code.' }}</p>
            </div>
            <button type="button" aria-label="Close" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>

          <form class="mt-5 flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div v-if="!discount" class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="discount-course">Course *</label>
              <AppDropdown id="discount-course" v-model="form.courseSlug" :options="courseOptions" placeholder="Select a paid course" />
            </div>

            <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div class="flex min-w-0 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="discount-type">Type</label>
                <AppDropdown id="discount-type" v-model="form.discountType" :options="typeOptions" />
              </div>
              <div class="flex min-w-0 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="discount-value">{{ form.discountType === 'PERCENT' ? 'Percent off *' : 'Amount off ($) *' }}</label>
                <input id="discount-value" v-model.number="form.discountValue" type="number" required min="0.01" :max="form.discountType === 'PERCENT' ? 100 : undefined" step="0.01" :class="inputClass">
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div class="flex min-w-0 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="discount-starts">Starts</label>
                <input id="discount-starts" v-model="form.startsAt" type="datetime-local" :class="inputClass">
                <span v-if="!discount" class="text-[11px] text-white/40 light:text-slate-500">Leave empty to start now.</span>
              </div>
              <div class="flex min-w-0 flex-col gap-1.5">
                <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="discount-ends">Ends</label>
                <input id="discount-ends" v-model="form.endsAt" type="datetime-local" :class="inputClass">
                <span v-if="!discount" class="text-[11px] text-white/40 light:text-slate-500">Leave empty to run until you end it.</span>
              </div>
            </div>

            <div class="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4.5 py-2.25 text-[13px] font-medium text-white/70 transition-all hover:bg-white/9 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700" :disabled="loading" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.25 text-[13px] font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50" :disabled="loading || !canSubmit">
                <Loader2 v-if="loading" :size="16" class="animate-spin" />
                {{ discount ? 'Save Discount' : 'Create Discount' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Loader2, X } from 'lucide-vue-next'
import type { Course, CourseDiscount, CourseDiscountCreate, CourseDiscountUpdate } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useModalA11y } from '~/composables/useModalA11y'
import { fromLocalInput, toLocalInput } from '~/utils/dateTime'

const props = defineProps<{
  isOpen: boolean
  discount?: CourseDiscount | null
  courses: Course[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', data: CourseDiscountCreate): void
  (e: 'update', data: CourseDiscountUpdate): void
}>()

const dialogRef = ref<HTMLElement | null>(null)

useModalA11y({
  isOpen: computed(() => props.isOpen),
  dialogRef,
  onClose: () => emit('close')
})

const modalFade = {
  enterActiveClass: 'transition-opacity duration-250 ease-out',
  leaveActiveClass: 'transition-opacity duration-250 ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600'

const typeOptions = [
  { value: 'PERCENT', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed amount' }
]

// A free course has no price to discount, and the backend rejects it
const courseOptions = computed(() => props.courses
  .filter(course => Number(course.price) > 0)
  .map(course => ({ value: course.slug, label: course.title })))

const form = reactive({
  courseSlug: '',
  discountType: 'PERCENT',
  discountValue: 20 as number,
  startsAt: '',
  endsAt: ''
})

const canSubmit = computed(() => (props.discount || form.courseSlug) && Number(form.discountValue) > 0)

watch(
  () => [props.isOpen, props.discount] as const,
  ([open, discount]) => {
    if (!open) return
    form.courseSlug = discount?.courseSlug ?? ''
    form.discountType = discount?.discountType.toUpperCase() ?? 'PERCENT'
    form.discountValue = discount ? Number(discount.discountValue) : 20
    form.startsAt = toLocalInput(discount?.startsAt)
    form.endsAt = toLocalInput(discount?.endsAt)
  },
  { immediate: true }
)

function handleSubmit() {
  const shared = {
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    startsAt: fromLocalInput(form.startsAt),
    endsAt: fromLocalInput(form.endsAt)
  }
  if (props.discount) {
    emit('update', shared)
  } else {
    emit('create', { ...shared, courseSlug: form.courseSlug })
  }
}
</script>
