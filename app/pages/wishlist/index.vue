<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Wishlist</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Courses you've saved for later.</p>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="!items.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <div class="mb-4 flex size-16 items-center justify-center rounded-[18px] border border-rose-400/30 bg-rose-500/12">
        <Heart :size="30" class="text-rose-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-100 light:text-slate-900">Your wishlist is empty</h3>
      <p class="mt-1.5 max-w-90 text-[13px] text-white/45 light:text-slate-500">Tap "Save" on any course page to keep it here.</p>
      <NuxtLink to="/courses" class="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white no-underline">
        <BookOpen :size="16" /> Browse courses
      </NuxtLink>
    </div>

    <ul v-else class="m-0 flex list-none flex-col gap-3 p-0">
      <li
        v-for="item in items"
        :key="item.courseId"
        class="flex flex-col gap-4 rounded-[18px] border border-white/8 bg-zinc-950/65 p-3.5 sm:flex-row sm:items-center light:border-slate-200 light:bg-white"
      >
        <NuxtLink :to="`/courses/${item.slug}`" class="block aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
          <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="size-full object-cover">
        </NuxtLink>

        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/courses/${item.slug}`" class="no-underline">
            <h3 class="line-clamp-2 text-[15px] font-bold text-slate-100 hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ item.title }}</h3>
          </NuxtLink>
          <p class="mt-1 text-xs text-white/45 light:text-slate-500">
            {{ item.instructor }} · {{ item.level }}
            <span v-if="Number(item.rating) > 0" class="ml-1 inline-flex items-center gap-0.5 text-amber-400">
              <Star :size="11" class="fill-amber-400" /> {{ Number(item.rating).toFixed(1) }}
            </span>
          </p>
        </div>

        <div class="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span class="text-lg font-extrabold text-emerald-400 light:text-emerald-700">
            {{ Number(item.price) <= 0 ? 'Free' : `$${Number(item.price).toFixed(2)}` }}
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:hover:text-rose-600"
              :disabled="removing === item.slug"
              @click="remove(item.slug, item.title)"
            >
              Remove
            </button>
            <NuxtLink
              :to="`/courses/${item.slug}`"
              class="rounded-[10px] border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 no-underline hover:bg-violet-500/30 hover:text-white light:border-violet-300 light:bg-violet-50 light:text-violet-700"
            >
              View course
            </NuxtLink>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Heart, Star } from 'lucide-vue-next'
import type { WishlistItem } from '~/types'
import { useLearning } from '~/composables/useLearning'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'

useHead({ title: 'Wishlist' })

const { fetchWishlist, removeFromWishlist } = useLearning()
const toast = useAppToast()

const { data, pending } = await useAsyncData('my-wishlist', fetchWishlist, { server: false })

const items = computed<WishlistItem[]>(() => data.value ?? [])
const removing = ref<string | null>(null)

async function remove(slug: string, title: string) {
  removing.value = slug
  try {
    await removeFromWishlist(slug)
    data.value = items.value.filter(item => item.slug !== slug)
    toast.info('Removed from Wishlist', title)
  } catch (err) {
    toast.error('Wishlist Update Failed', getErrorMessage(err, 'Unable to remove course'))
  } finally {
    removing.value = null
  }
}
</script>
