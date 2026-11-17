<template>
  <span class="inline-flex">
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700"
      @click="open = true"
    >
      <Gift :size="15" />
      {{ t('Give as a gift') }}
    </button>

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6" @click.self="open = false">
        <form
          ref="dialogRef"
          class="w-full max-w-120 rounded-[20px] border border-violet-500/25 bg-[#0f1019] p-5 focus:outline-none sm:p-6 light:border-violet-500/30 light:bg-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-course-title"
          tabindex="-1"
          @submit.prevent="send"
        >
          <h3 id="gift-course-title" class="text-lg font-bold text-slate-50 light:text-slate-900">{{ t('Give {title}', { title: course.title }) }}</h3>
          <p class="mt-1 text-[13px] text-white/50 light:text-slate-600">{{ t('You pay now. Your friend gets a code by email that unlocks the course.') }}</p>

          <label for="gift-email" :class="labelClass" class="mt-4">{{ t('Recipient email') }}</label>
          <input id="gift-email" v-model="recipientEmail" type="email" required autocomplete="off" :class="inputClass">

          <label for="gift-message" :class="labelClass" class="mt-3">{{ t('Message (optional)') }}</label>
          <textarea id="gift-message" v-model="message" rows="3" maxlength="500" :class="inputClass" />

          <fieldset class="mt-3">
            <legend :class="labelClass">{{ t('Pay with') }}</legend>
            <div class="flex flex-wrap gap-4 text-[13px] text-white/75 light:text-slate-700">
              <label class="inline-flex items-center gap-2"><input v-model="paymentMethod" type="radio" value="ONLINE" class="size-4 accent-violet-600"> {{ t('Online payment') }}</label>
              <label class="inline-flex items-center gap-2"><input v-model="paymentMethod" type="radio" value="MEMBER_CARD" class="size-4 accent-violet-600"> {{ t('Member card') }}</label>
            </div>
          </fieldset>

          <p class="mt-3 text-sm font-bold text-emerald-400 light:text-emerald-700">{{ formatMoney(course.price) }}</p>

          <div class="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button type="button" class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-4.5 py-2.25 text-[13px] font-medium text-white/70 light:border-slate-200 light:bg-slate-100 light:text-slate-700" :disabled="sending" @click="open = false">{{ t('Cancel') }}</button>
            <button type="submit" :class="primaryButton" :disabled="sending || !recipientEmail.trim()">
              <Loader2 v-if="sending" :size="16" class="animate-spin" />
              {{ t('Continue to payment') }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { Gift, Loader2 } from 'lucide-vue-next'
import type { Course, PaymentMethod } from '~/types'
import { useAppToast } from '~/composables/useAppToast'
import { formatMoney } from '~/composables/useCart'
import { useGifts } from '~/composables/useGifts'
import { useModalA11y } from '~/composables/useModalA11y'
import { getErrorMessage } from '~/utils/apiError'
import { inputClass, labelClass, primaryButton } from '~/utils/ui'

/** Buys the course for someone else; once paid, they get a redeemable code by email. */
const props = defineProps<{ course: Course }>()

const { t } = useT()
const toast = useAppToast()
const { sendGift } = useGifts()

const open = ref(false)
const dialogRef = ref<HTMLElement | null>(null)
const recipientEmail = ref('')
const message = ref('')
const paymentMethod = ref<PaymentMethod>('ONLINE')
const sending = ref(false)

useModalA11y({ isOpen: open, dialogRef, onClose: () => { open.value = false } })

async function send() {
  sending.value = true
  try {
    const order = await sendGift({
      courseSlug: props.course.slug,
      recipientEmail: recipientEmail.value.trim(),
      message: message.value.trim() || undefined,
      paymentMethod: paymentMethod.value,
    })
    if (order.checkoutUrl) {
      await navigateTo(order.checkoutUrl, { external: true })
      return
    }
    toast.success(t('Gift sent'), t('{email} will get a code by email.', { email: recipientEmail.value.trim() }))
    open.value = false
    recipientEmail.value = ''
    message.value = ''
  } catch (err) {
    toast.error(t('Gift not sent'), getErrorMessage(err, t('Unable to send the gift')))
  } finally {
    sending.value = false
  }
}
</script>
