<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Your cart') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('Courses you want to buy together in one payment.') }}</p>
    </div>

    <div v-if="pending" class="h-40 animate-pulse rounded-2xl bg-white/5 light:bg-slate-100" />

    <p v-else-if="loadError" class="rounded-2xl border border-rose-500/25 bg-rose-500/8 px-5 py-6 text-center text-[13px] text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-700">
      {{ loadError }}
    </p>

    <div v-else-if="!cart?.items.length" class="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center light:border-slate-200 light:bg-white">
      <ShoppingCart :size="32" class="text-violet-400" />
      <p class="mt-3 text-sm font-bold text-slate-100 light:text-slate-900">{{ t('Your cart is empty') }}</p>
      <NuxtLink to="/courses" class="mt-3 text-xs font-semibold text-violet-300 light:text-violet-700">{{ t('Browse Courses') }}</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <ul class="m-0 flex list-none flex-col gap-3 p-0 lg:col-span-2">
        <li
          v-for="item in cart.items"
          :key="item.courseId"
          class="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 p-4 light:border-slate-200 light:bg-white"
        >
          <img :src="item.thumbnail" alt="" class="hidden aspect-video w-28 shrink-0 rounded-lg object-cover sm:block">
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/courses/${item.slug}`" class="text-sm font-bold text-slate-100 no-underline hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">
              {{ item.title }}
            </NuxtLink>
            <p class="text-xs text-white/50 light:text-slate-500">{{ item.instructor }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-50 light:text-slate-900">{{ formatMoney(item.price, cart.currency) }}</p>
            <p v-if="item.listPrice > item.price" class="text-[11px] text-white/35 line-through light:text-slate-400">{{ formatMoney(item.listPrice, cart.currency) }}</p>
          </div>
          <button
            type="button"
            class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-rose-400 hover:bg-rose-500/10 disabled:cursor-wait disabled:opacity-60 light:border-slate-200 light:bg-slate-100 light:text-rose-600"
            :aria-label="t('Remove {title} from cart', { title: item.title })"
            :disabled="removing === item.slug"
            @click="removeItem(item.slug)"
          >
            <Trash2 :size="15" />
          </button>
        </li>
      </ul>

      <aside class="h-fit rounded-[18px] border border-white/10 bg-white/5 p-5 lg:sticky lg:top-20 light:border-slate-200 light:bg-white">
        <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Order summary') }}</h2>
        <dl class="mt-4 flex flex-col gap-2 text-[13px]">
          <div class="flex justify-between text-white/60 light:text-slate-600">
            <dt>{{ t('Courses') }}</dt>
            <dd>{{ cart.items.length }}</dd>
          </div>
          <div v-if="cart.listTotal > cart.total" class="flex justify-between text-white/60 light:text-slate-600">
            <dt>{{ t('Regular price') }}</dt>
            <dd class="line-through">{{ formatMoney(cart.listTotal, cart.currency) }}</dd>
          </div>
          <div class="mt-1 flex justify-between border-t border-white/8 pt-3 text-base font-extrabold text-slate-50 light:border-slate-200 light:text-slate-900">
            <dt>{{ t('Total') }}</dt>
            <dd>{{ formatMoney(cart.total, cart.currency) }}</dd>
          </div>
        </dl>
        <NuxtLink
          to="/checkout"
          class="mt-4 flex items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white no-underline hover:from-violet-500 hover:to-indigo-500"
        >
          {{ t('Continue to checkout') }} <ArrowRight :size="15" />
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-vue-next'
import { formatMoney, useCart } from '~/composables/useCart'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
useHead({ title: () => t('Your cart') })

const { cart, refresh, remove } = useCart()
const toast = useAppToast()

const pending = ref(true)
const loadError = ref('')
const removing = ref<string | null>(null)

async function removeItem(slug: string) {
  removing.value = slug
  try {
    await remove(slug)
  } catch (err) {
    toast.error(t('Not removed'), getErrorMessage(err, t('Please try again.')))
  } finally {
    removing.value = null
  }
}

onMounted(async () => {
  try {
    await refresh()
  } catch (err) {
    loadError.value = getErrorMessage(err, t('Unable to load your cart'))
  } finally {
    pending.value = false
  }
})
</script>
