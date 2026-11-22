<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-[#060b09]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="$emit('close')">
        <div ref="dialogRef" class="max-h-[90dvh] w-full max-w-130 overflow-y-auto overscroll-contain rounded-[20px] border border-brand-500/25 bg-[#101814] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] focus:outline-none sm:p-6 light:border-brand-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="coupon-modal-title" tabindex="-1">
          <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4.5 light:border-slate-200">
            <div>
              <h2 id="coupon-modal-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ coupon ? `Edit ${coupon.code}` : t('New Coupon') }}</h2>
              <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ coupon ? t('The discount is fixed once a code exists.') : t('Learners type the code at checkout.') }}</p>
            </div>
            <button type="button" :aria-label="t('Close')" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>

          <form class="mt-5 flex flex-col gap-4" @submit.prevent="handleSubmit">
            <template v-if="!coupon">
              <div class="flex flex-col gap-1.5">
                <label :class="labelClass" for="coupon-code">{{ t('Code *') }}</label>
                <input id="coupon-code" v-model="form.code" type="text" required minlength="3" maxlength="40" pattern="[A-Za-z0-9_\-]+" :placeholder="t('e.g. WELCOME20')" :class="[inputClass, 'uppercase']">
              </div>

              <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div class="flex min-w-0 flex-col gap-1.5">
                  <label :class="labelClass" for="coupon-type">{{ t('Type') }}</label>
                  <AppDropdown id="coupon-type" v-model="form.discountType" :options="typeOptions" />
                </div>
                <div class="flex min-w-0 flex-col gap-1.5">
                  <label :class="labelClass" for="coupon-value">{{ form.discountType === 'PERCENT' ? t('Percent off *') : t('Amount off ($) *') }}</label>
                  <input id="coupon-value" v-model.number="form.discountValue" type="number" required min="0.01" :max="form.discountType === 'PERCENT' ? 100 : undefined" step="0.01" :class="inputClass">
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label :class="labelClass" for="coupon-course">{{ t('Course') }}</label>
                <AppDropdown id="coupon-course" v-model="form.courseSlug" :options="courseOptions" />
              </div>
            </template>

            <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div class="flex min-w-0 flex-col gap-1.5">
                <label :class="labelClass" for="coupon-max">{{ t('Max uses') }}</label>
                <input id="coupon-max" v-model.number="form.maxRedemptions" type="number" min="1" step="1" :placeholder="t('Unlimited')" :class="inputClass">
              </div>
              <div class="flex min-w-0 flex-col gap-1.5">
                <label :class="labelClass" for="coupon-expires">{{ t('Expires') }}</label>
                <input id="coupon-expires" v-model="form.expiresAt" type="datetime-local" :class="inputClass">
              </div>
            </div>

            <div v-if="!coupon" class="flex flex-col gap-1.5">
              <label :class="labelClass" for="coupon-starts">{{ t('Starts') }}</label>
              <input id="coupon-starts" v-model="form.startsAt" type="datetime-local" :class="inputClass">
            </div>

            <div class="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4.5 py-2.25 text-[13px] font-medium text-white/70 transition-all hover:bg-white/9 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700" :disabled="loading" @click="$emit('close')">
                {{ t('Cancel') }}
              </button>
              <button type="submit" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-brand-500/40 bg-brand-500 px-5 py-2.25 text-[13px] font-semibold text-white transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50" :disabled="loading">
                <Loader2 v-if="loading" :size="16" class="animate-spin" />
                {{ coupon ? t('Save Coupon') : t('Create Coupon') }}
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
import type { Coupon, CouponCreate, CouponUpdate, Course } from '~/types'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useModalA11y } from '~/composables/useModalA11y'
import { fromLocalInput, toLocalInput } from '~/utils/dateTime'

const { t } = useT()

const ALL_COURSES = 'all'

const props = defineProps<{
  isOpen: boolean
  coupon?: Coupon | null
  courses: Course[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', data: CouponCreate): void
  (e: 'update', data: CouponUpdate): void
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

const labelClass = 'text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600'
const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-brand-500/50 focus:bg-white/7 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-brand-600'

const typeOptions = [
  { value: 'PERCENT', label: t('Percentage') },
  { value: 'FIXED', label: t('Fixed amount') }
]

const courseOptions = computed(() => [
  { value: ALL_COURSES, label: t('All courses') },
  ...props.courses.filter(course => Number(course.price) > 0).map(course => ({ value: course.slug, label: course.title }))
])

const form = reactive({
  code: '',
  discountType: 'PERCENT',
  discountValue: 10 as number,
  courseSlug: ALL_COURSES,
  maxRedemptions: '' as number | '',
  startsAt: '',
  expiresAt: ''
})

watch(
  () => [props.isOpen, props.coupon] as const,
  ([open, coupon]) => {
    if (!open) return
    form.code = ''
    form.discountType = 'PERCENT'
    form.discountValue = 10
    form.courseSlug = ALL_COURSES
    form.maxRedemptions = coupon?.maxRedemptions ?? ''
    form.startsAt = ''
    form.expiresAt = toLocalInput(coupon?.expiresAt)
  },
  { immediate: true }
)

function handleSubmit() {
  const limits = {
    maxRedemptions: form.maxRedemptions === '' ? undefined : Number(form.maxRedemptions),
    expiresAt: fromLocalInput(form.expiresAt)
  }
  if (props.coupon) {
    emit('update', limits)
    return
  }
  emit('create', {
    ...limits,
    code: form.code.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    courseSlug: form.courseSlug === ALL_COURSES ? undefined : form.courseSlug,
    startsAt: fromLocalInput(form.startsAt)
  })
}
</script>
