<template>
  <Teleport to="body">
    <Transition v-bind="modalFade">
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-[#05050c]/82 p-4 backdrop-blur-xl sm:p-6" @click.self="$emit('close')">
        <div ref="dialogRef" class="max-h-[90dvh] w-full max-w-110 overflow-y-auto overscroll-contain rounded-[20px] border border-violet-500/25 bg-[#0f1019] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] focus:outline-none sm:p-6 light:border-violet-500/30 light:bg-white" role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title" tabindex="-1">
          <div class="flex items-start justify-between gap-4 border-b border-white/8 pb-4.5 light:border-slate-200">
            <div class="min-w-0">
              <h2 id="checkout-modal-title" class="text-lg font-bold text-slate-50 light:text-slate-900">Checkout</h2>
              <p class="mt-0.5 truncate text-xs text-white/45 light:text-slate-500">{{ course.title }}</p>
            </div>
            <button type="button" aria-label="Close" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-500 light:hover:bg-slate-200 light:hover:text-slate-900" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>

          <form class="mt-5 flex flex-col gap-1.5" @submit.prevent="applyCoupon">
            <label class="text-[11px] font-semibold tracking-wider text-white/60 uppercase light:text-slate-600" for="checkout-coupon">Coupon code</label>
            <div class="flex gap-2">
              <input id="checkout-coupon" v-model="code" type="text" maxlength="40" autocomplete="off" placeholder="Enter a code" class="min-w-0 flex-1 rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 uppercase outline-none transition-all duration-200 placeholder:text-white/30 placeholder:normal-case focus:border-violet-500/50 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600">
              <button type="submit" class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/75 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700" :disabled="applying || !code.trim()">
                <Loader2 v-if="applying" :size="14" class="animate-spin" />
                Apply
              </button>
            </div>
            <p v-if="couponError" class="text-xs text-rose-400 light:text-rose-600" role="alert">{{ couponError }}</p>
          </form>

          <dl class="m-0 mt-5 flex flex-col gap-2 border-t border-white/8 pt-4 text-[13px] light:border-slate-200">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-white/55 light:text-slate-500">Price</dt>
              <dd class="m-0 text-slate-100 light:text-slate-900">${{ Number(preview?.listAmount ?? course.price).toFixed(2) }}</dd>
            </div>
            <div v-if="preview && Number(preview.discountAmount) > 0" class="flex items-center justify-between gap-3">
              <dt class="text-white/55 light:text-slate-500">
                Discount
                <button type="button" class="ml-1 cursor-pointer text-xs font-semibold text-violet-300 underline light:text-violet-700" @click="removeCoupon">Remove {{ preview.code }}</button>
              </dt>
              <dd class="m-0 text-emerald-400 light:text-emerald-700">-${{ Number(preview.discountAmount).toFixed(2) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-white/8 pt-2.5 light:border-slate-200">
              <dt class="font-bold text-slate-100 light:text-slate-900">Total</dt>
              <dd class="m-0 text-xl font-extrabold text-emerald-400 light:text-emerald-700">${{ Number(preview?.finalAmount ?? course.price).toFixed(2) }}</dd>
            </div>
          </dl>

          <button
            type="button"
            class="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)] transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60"
            :disabled="loading"
            @click="$emit('confirm', preview?.code)"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <ShoppingCart v-else :size="16" />
            {{ preview && Number(preview.finalAmount) <= 0 ? 'Enroll now' : 'Continue to payment' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Loader2, ShoppingCart, X } from 'lucide-vue-next'
import type { Course, CouponPreview } from '~/types'
import { useCoupons } from '~/composables/useCoupons'
import { useModalA11y } from '~/composables/useModalA11y'
import { getErrorMessage } from '~/utils/apiError'

const props = defineProps<{
  isOpen: boolean
  course: Course
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', couponCode?: string): void
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

const { previewCoupon } = useCoupons()

const code = ref('')
const preview = ref<CouponPreview | null>(null)
const applying = ref(false)
const couponError = ref('')

watch(() => props.isOpen, (open) => {
  if (open) removeCoupon()
})

function removeCoupon() {
  code.value = ''
  preview.value = null
  couponError.value = ''
}

async function applyCoupon() {
  applying.value = true
  couponError.value = ''
  try {
    preview.value = await previewCoupon(props.course.slug, code.value.trim())
  } catch (err) {
    preview.value = null
    couponError.value = getErrorMessage(err, 'This coupon can\'t be used')
  } finally {
    applying.value = false
  }
}
</script>
