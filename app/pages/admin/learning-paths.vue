<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">Learning Paths</h1>
        <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">Group courses into a recommended order. Learners who finish them all earn a path certificate.</p>
      </div>
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:from-violet-500 hover:to-indigo-500"
        @click="openForm(null)"
      >
        <Plus :size="16" /> New Path
      </button>
    </div>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-[14px] bg-white/5 light:bg-slate-100" />
    </div>
    <div v-else-if="error" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <AlertCircle :size="40" class="text-rose-400" />
      <p class="mt-3 text-[13px] text-white/50 light:text-slate-500">{{ getErrorMessage(error, 'Unable to load learning paths') }}</p>
    </div>
    <div v-else-if="!items.length" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-6 py-15 text-center light:border-slate-200 light:bg-white">
      <Route :size="32" class="text-violet-400" />
      <h3 class="mt-3 text-lg font-bold text-slate-100 light:text-slate-900">No learning paths yet</h3>
    </div>

    <div v-else class="overflow-x-auto rounded-[18px] border border-white/10 bg-white/5 light:border-slate-200 light:bg-white">
      <table class="w-full min-w-180 border-collapse text-left text-[13px]">
        <thead>
          <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
            <th class="px-4 py-3 font-semibold">Path</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Courses</th>
            <th class="px-4 py-3 font-semibold">Price</th>
            <th class="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="item in items" :key="item.slug" class="hover:bg-white/3 light:hover:bg-slate-50">
            <td class="px-4 py-3">
              <NuxtLink v-if="item.status === 'published'" :to="`/learning-paths/${item.slug}`" class="font-semibold text-slate-100 no-underline hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700">{{ item.title }}</NuxtLink>
              <span v-else class="font-semibold text-slate-100 light:text-slate-900">{{ item.title }}</span>
              <span class="block text-xs text-white/40 light:text-slate-500">{{ formatDateTime(item.updatedAt) }}</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                :class="item.status === 'published' ? 'bg-emerald-400/15 text-emerald-400 light:bg-emerald-50 light:text-emerald-700' : 'bg-amber-400/15 text-amber-400 light:bg-amber-50 light:text-amber-700'"
              >
                {{ item.status === 'published' ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ item.courseCount }}</td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ Number(item.price) > 0 ? formatMoney(item.price) : 'Free' }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button type="button" class="mr-2 cursor-pointer rounded-lg border border-violet-500/35 bg-violet-500/15 px-2.5 py-1.5 text-xs font-semibold text-violet-300 light:border-violet-300 light:bg-violet-50 light:text-violet-700" @click="openForm(item)">Edit</button>
              <button type="button" class="cursor-pointer rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 light:border-rose-200 light:bg-rose-50 light:text-rose-600" @click="pendingDelete = item">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <LearningPathFormModal
      :is-open="formOpen"
      :path="editing"
      :courses="allCourses"
      :loading="saving"
      @close="formOpen = false"
      @submit="save"
    />

    <ConfirmDeleteModal
      :is-open="Boolean(pendingDelete)"
      title="Delete Learning Path"
      description="Path certificates already issued stay valid."
      :item-name="pendingDelete?.title"
      :loading="deleting"
      @close="pendingDelete = null"
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Plus, Route } from 'lucide-vue-next'
import type { LearningPath, LearningPathForm } from '~/types/learningPath'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import LearningPathFormModal from '~/components/learningpaths/LearningPathFormModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { formatMoney } from '~/composables/useCart'
import { useCourses } from '~/composables/useCourses'
import { useLearningPaths } from '~/composables/useLearningPaths'
import { getErrorMessage } from '~/utils/apiError'
import { formatDateTime } from '~/utils/dateTime'

definePageMeta({ requiresAdmin: true })
useHead({ title: 'Learning Paths' })

const toast = useAppToast()
const { fetchAllForAdmin, createPath, updatePath, deletePath } = useLearningPaths()
const { courses: allCourses, fetchCourses } = useCourses()

const { data, pending, error, refresh } = await useAsyncData('admin-learning-paths', fetchAllForAdmin, { server: false })
const items = computed(() => data.value ?? [])

const formOpen = ref(false)
const editing = ref<LearningPath | null>(null)
const saving = ref(false)
const pendingDelete = ref<LearningPath | null>(null)
const deleting = ref(false)

function openForm(path: LearningPath | null) {
  editing.value = path
  formOpen.value = true
}

async function save(form: LearningPathForm) {
  saving.value = true
  try {
    if (editing.value) {
      await updatePath(editing.value.slug, form)
      toast.success('Path Updated', form.title)
    } else {
      await createPath(form)
      toast.success('Path Created', form.title)
    }
    formOpen.value = false
    await refresh()
  } catch (err) {
    toast.error('Not Saved', getErrorMessage(err, 'Unable to save the learning path'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  const target = pendingDelete.value
  if (!target) return
  deleting.value = true
  try {
    await deletePath(target.slug)
    toast.success('Path Deleted', target.title)
    pendingDelete.value = null
    await refresh()
  } catch (err) {
    toast.error('Not Deleted', getErrorMessage(err, 'Unable to delete the learning path'))
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  // Admins see every course status, so drafts can be lined up before they go live
  fetchCourses({ sort: 'title', order: 'asc' })
})
</script>
