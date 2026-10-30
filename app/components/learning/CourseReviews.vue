<template>
  <div class="rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6 light:border-slate-200 light:bg-white">
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-bold text-slate-100 light:text-slate-900">Learner Reviews</h3>
        <p class="mt-0.5 text-xs text-white/40 light:text-slate-500">
          <template v-if="page && page.totalElements">
            {{ page.totalElements }} {{ page.totalElements === 1 ? 'review' : 'reviews' }}
          </template>
          <template v-else>No reviews yet</template>
        </p>
      </div>
      <span v-if="page?.averageRating" class="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[13px] font-bold text-amber-400 light:border-amber-200 light:bg-amber-50 light:text-amber-600">
        <Star :size="14" class="fill-amber-400 text-amber-400" />
        {{ Number(page.averageRating).toFixed(1) }}
      </span>
    </div>

    <!-- My review (enrolled learners only) -->
    <form
      v-if="canReview"
      class="mb-5 rounded-xl border border-violet-500/25 bg-violet-500/8 p-4 light:border-violet-200 light:bg-violet-50/60"
      @submit.prevent="handleSave"
    >
      <div class="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <span class="text-[13px] font-semibold text-slate-100 light:text-slate-900">
          {{ myReview ? 'Your review' : 'Rate this course' }}
        </span>
        <div class="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            role="radio"
            :aria-checked="draftRating === n"
            :aria-label="`${n} star${n > 1 ? 's' : ''}`"
            class="cursor-pointer rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            @click="draftRating = n"
            @mouseenter="hoverRating = n"
            @mouseleave="hoverRating = 0"
          >
            <Star
              :size="20"
              :class="n <= (hoverRating || draftRating) ? 'fill-amber-400 text-amber-400' : 'text-white/25 light:text-slate-300'"
            />
          </button>
        </div>
      </div>

      <textarea
        v-model="draftComment"
        rows="3"
        maxlength="2000"
        placeholder="What did you think of this course? (optional)"
        aria-label="Review comment"
        class="w-full resize-y rounded-[10px] border border-white/9 bg-white/4 px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/35 focus:border-violet-500/65 focus:ring-2 focus:ring-violet-500/20 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400"
      />

      <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button
          v-if="myReview"
          type="button"
          class="cursor-pointer rounded-[10px] border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 light:border-rose-200 light:bg-rose-50 light:text-rose-600"
          :disabled="saving"
          @click="handleDeleteMine"
        >
          Delete
        </button>
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="saving || !draftRating"
        >
          <Loader2 v-if="saving" :size="14" class="animate-spin" />
          {{ myReview ? 'Update review' : 'Post review' }}
        </button>
      </div>
    </form>

    <div v-if="loading && !page" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-18 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />
    </div>

    <div v-else-if="!reviews.length" class="px-2.5 py-8 text-center text-[13px] text-white/40 light:text-slate-500">
      <MessageSquare :size="26" class="mx-auto mb-2 text-white/30 light:text-slate-300" />
      <p>{{ canReview ? 'Be the first to share your thoughts.' : 'No one has reviewed this course yet.' }}</p>
    </div>

    <ul v-else class="m-0 flex list-none flex-col gap-3 p-0">
      <li
        v-for="review in reviews"
        :key="review.id"
        class="flex gap-3 rounded-xl border border-white/6 bg-white/2 p-3.5 light:border-slate-200 light:bg-slate-50"
      >
        <img
          :src="review.reviewerAvatar || avatarFor(review.reviewerName)"
          :alt="review.reviewerName"
          class="size-9 shrink-0 rounded-full bg-violet-500/20"
        >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ review.reviewerName }}</span>
            <span class="flex items-center gap-px" :aria-label="`${review.rating} out of 5 stars`">
              <Star
                v-for="n in 5"
                :key="n"
                :size="12"
                :class="n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20 light:text-slate-300'"
              />
            </span>
            <span class="text-[11px] text-white/35 light:text-slate-400">{{ formatDate(review.updatedAt || review.createdAt) }}</span>
            <button
              v-if="canModerate"
              type="button"
              class="ml-auto flex size-7 cursor-pointer items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:text-rose-600"
              :aria-label="`Delete review by ${review.reviewerName}`"
              title="Delete review"
              @click="moderating = review"
            >
              <Trash2 :size="14" />
            </button>
          </div>
          <p v-if="review.comment" class="mt-1.5 text-[13px] leading-relaxed whitespace-pre-line text-white/65 light:text-slate-600">{{ review.comment }}</p>
        </div>
      </li>
    </ul>

    <div v-if="page && page.page + 1 < page.totalPages" class="mt-4 flex justify-center">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/9 hover:text-white disabled:opacity-50 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
        :disabled="loading"
        @click="loadPage(page.page + 1, true)"
      >
        <Loader2 v-if="loading" :size="14" class="animate-spin" />
        Show more reviews
      </button>
    </div>

    <ConfirmDeleteModal
      :is-open="Boolean(moderating)"
      title="Delete Review"
      description="This review will be removed and the course rating recalculated."
      :item-name="moderating ? `${moderating.reviewerName} · ${moderating.rating}★` : undefined"
      :loading="saving"
      @close="moderating = null"
      @confirm="handleModerate"
    />
  </div>
</template>

<script setup lang="ts">
import { Loader2, MessageSquare, Star, Trash2 } from 'lucide-vue-next'
import type { Review, ReviewPage } from '~/types'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import { useReviews } from '~/composables/useReviews'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'

const props = withDefaults(
  defineProps<{
    slug: string
    canReview?: boolean
    canModerate?: boolean
  }>(),
  {
    canReview: false,
    canModerate: false
  }
)

// Fired after any change that alters the course's average rating
const emit = defineEmits<{ changed: [] }>()

const { fetchReviews, fetchMyReview, saveMyReview, deleteMyReview, deleteReviewAsAdmin } = useReviews()
const toast = useAppToast()

const PAGE_SIZE = 5

const page = ref<ReviewPage | null>(null)
const reviews = ref<Review[]>([])
const loading = ref(false)
const saving = ref(false)
const myReview = ref<Review | null>(null)
const draftRating = ref(0)
const hoverRating = ref(0)
const draftComment = ref('')
const moderating = ref<Review | null>(null)

async function loadPage(pageIndex = 0, append = false) {
  loading.value = true
  try {
    const result = await fetchReviews(props.slug, pageIndex, PAGE_SIZE)
    page.value = result
    reviews.value = append ? [...reviews.value, ...result.items] : result.items
  } catch (err) {
    toast.error('Reviews Unavailable', getErrorMessage(err, 'Unable to load reviews'))
  } finally {
    loading.value = false
  }
}

async function loadMine() {
  if (!props.canReview) return
  try {
    myReview.value = await fetchMyReview(props.slug)
    draftRating.value = myReview.value?.rating ?? 0
    draftComment.value = myReview.value?.comment ?? ''
  } catch {
    myReview.value = null
  }
}

async function handleSave() {
  if (!draftRating.value) return
  saving.value = true
  try {
    myReview.value = await saveMyReview(props.slug, draftRating.value, draftComment.value.trim())
    toast.success('Review Saved', 'Thanks for sharing your feedback.')
    await loadPage()
    emit('changed')
  } catch (err) {
    toast.error('Review Not Saved', getErrorMessage(err, 'Unable to save your review'))
  } finally {
    saving.value = false
  }
}

async function handleDeleteMine() {
  saving.value = true
  try {
    await deleteMyReview(props.slug)
    myReview.value = null
    draftRating.value = 0
    draftComment.value = ''
    toast.info('Review Deleted')
    await loadPage()
    emit('changed')
  } catch (err) {
    toast.error('Delete Failed', getErrorMessage(err, 'Unable to delete your review'))
  } finally {
    saving.value = false
  }
}

async function handleModerate() {
  if (!moderating.value) return
  saving.value = true
  try {
    await deleteReviewAsAdmin(props.slug, moderating.value.id)
    toast.crud('delete', 'Review', moderating.value.reviewerName)
    moderating.value = null
    await loadPage()
    emit('changed')
  } catch (err) {
    toast.error('Delete Failed', getErrorMessage(err, 'Unable to delete review'))
  } finally {
    saving.value = false
  }
}

function avatarFor(name: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || 'Learner')}&backgroundColor=b6e3f4`
}

function formatDate(value: string) {
  const date = new Date(value)
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

watch(() => [props.slug, props.canReview], () => {
  loadPage()
  loadMine()
}, { immediate: true })
</script>
