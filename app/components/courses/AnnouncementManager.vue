<template>
  <section class="rounded-[18px] border border-white/10 bg-white/5 p-5 light:border-slate-200 light:bg-white">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 class="flex items-center gap-2 text-base font-bold text-slate-100 light:text-slate-900">
          <Megaphone :size="17" class="text-violet-400" /> {{ t('Announcements') }}
        </h2>
        <p class="mt-0.5 text-xs text-white/45 light:text-slate-500">
          {{ t('Every enrolled learner is notified, including on Telegram. Up to 5 a day.') }}
        </p>
      </div>
    </div>

    <p v-if="!published" class="mt-3 rounded-xl border border-white/8 bg-white/3 px-3.5 py-2.5 text-xs text-white/50 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
      {{ t('You can send announcements once the course is published.') }}
    </p>

    <form v-else class="mt-4 flex flex-col gap-2.5" @submit.prevent="submit">
      <input v-model="form.title" type="text" required maxlength="150" :placeholder="t('Title, e.g. Live Q&A this Friday')" :aria-label="t('Announcement title')" :class="inputClass">
      <textarea v-model="form.body" required maxlength="5000" rows="3" :placeholder="t('Message to your learners')" :aria-label="t('Announcement message')" :class="inputClass" />
      <div class="flex items-center justify-between gap-3">
        <span class="text-[11px] text-white/35 light:text-slate-400">{{ form.body.length }}/5000</span>
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="sending || !form.title.trim() || !form.body.trim()"
        >
          <Loader2 v-if="sending" :size="14" class="animate-spin" />
          <Send v-else :size="14" />
          {{ t('Send to learners') }}
        </button>
      </div>
    </form>

    <div class="mt-5 border-t border-white/8 pt-4 light:border-slate-200">
      <h3 class="text-[13px] font-semibold text-slate-200 light:text-slate-800">{{ t('Sent') }}</h3>
      <div v-if="pending" class="mt-3 flex flex-col gap-2">
        <div v-for="i in 2" :key="i" class="h-14 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />
      </div>
      <p v-else-if="loadError" class="mt-2 text-xs text-rose-300 light:text-rose-700">{{ loadError }}</p>
      <p v-else-if="!items.length" class="mt-2 text-xs text-white/45 light:text-slate-500">{{ t('No announcements yet.') }}</p>
      <ul v-else class="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
        <li v-for="item in items" :key="item.id" class="rounded-xl border border-white/8 bg-white/3 p-3.5 light:border-slate-200 light:bg-slate-50">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ item.title }}</p>
              <p class="mt-0.5 text-[11px] text-white/40 light:text-slate-500">{{ item.authorName }} · {{ formatTimeAgo(item.createdAt) }}</p>
            </div>
            <button
              type="button"
              class="shrink-0 cursor-pointer rounded-lg p-1.5 text-white/40 transition-colors hover:bg-rose-500/15 hover:text-rose-300 light:text-slate-400 light:hover:bg-rose-50 light:hover:text-rose-600"
              :aria-label="t('Delete announcement')"
              @click="toDelete = item"
            >
              <Trash2 :size="14" />
            </button>
          </div>
          <p class="mt-2 text-xs whitespace-pre-line text-white/65 light:text-slate-600">{{ item.body }}</p>
        </li>
      </ul>
    </div>

    <ConfirmDeleteModal
      :is-open="Boolean(toDelete)"
      :title="t('Delete announcement')"
      :description="t('Learners who were already notified keep their notification.')"
      :item-name="toDelete?.title"
      :loading="deleting"
      @close="toDelete = null"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { Loader2, Megaphone, Send, Trash2 } from 'lucide-vue-next'
import type { Announcement } from '~/types/announcement'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import { useAnnouncements } from '~/composables/useAnnouncements'
import { useAppToast } from '~/composables/useAppToast'
import { getErrorMessage } from '~/utils/apiError'
import { formatTimeAgo } from '~/utils/dateTime'

/** Compose and manage a course's announcements, for its admins and owning instructor. */
const props = defineProps<{ slug: string, published: boolean }>()

const { t } = useT()
const toast = useAppToast()
const { fetchForStaff, send, remove } = useAnnouncements()

const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600'

const form = reactive({ title: '', body: '' })
const items = ref<Announcement[]>([])
const pending = ref(true)
const loadError = ref('')
const sending = ref(false)
const deleting = ref(false)
const toDelete = ref<Announcement | null>(null)

async function load() {
  loadError.value = ''
  try {
    items.value = (await fetchForStaff(props.slug)).content
  } catch (err) {
    loadError.value = getErrorMessage(err, t('Unable to load announcements'))
  } finally {
    pending.value = false
  }
}

async function submit() {
  sending.value = true
  try {
    const created = await send(props.slug, { title: form.title.trim(), body: form.body.trim() })
    items.value = [created, ...items.value]
    form.title = ''
    form.body = ''
    toast.success(t('Announcement sent'), t('Your learners have been notified.'))
  } catch (err) {
    toast.error(t('Not sent'), getErrorMessage(err, t('Unable to send this announcement')))
  } finally {
    sending.value = false
  }
}

async function confirmDelete() {
  const target = toDelete.value
  if (!target) return
  deleting.value = true
  try {
    await remove(props.slug, target.id)
    items.value = items.value.filter(item => item.id !== target.id)
    toDelete.value = null
  } catch (err) {
    toast.error(t('Not deleted'), getErrorMessage(err, t('Unable to delete this announcement')))
  } finally {
    deleting.value = false
  }
}

watch(() => props.slug, load, { immediate: true })
</script>
