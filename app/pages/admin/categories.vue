<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">{{ t('Categories') }}</h1>
      <p class="mt-1 text-[13px] text-white/45 light:text-slate-500">{{ t('The categories courses can be filed under.') }}</p>
    </div>

    <form class="flex max-w-lg items-center gap-2" @submit.prevent="add">
      <input v-model="newName" type="text" maxlength="100" :placeholder="t('New category')" :aria-label="t('New category')" class="w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400">
      <button type="submit" class="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-brand-500/40 bg-brand-500 text-white hover:bg-brand-600 shrink-0" :disabled="busy || !newName.trim()">{{ t('Add') }}</button>
    </form>

    <div v-if="pending" class="h-40 animate-pulse rounded-[18px] bg-white/5 light:bg-slate-100" />
    <p v-else-if="error" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">{{ getErrorMessage(error, t('Unable to load categories')) }}</p>
    <p v-else-if="!categories.length" class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">{{ t('No categories yet.') }}</p>

    <DataTableFrame v-else :label="t('Categories')" :scroll-key="tableScrollKey">
      <table class="w-full min-w-120 border-collapse text-left text-[13px]">
        <thead>
          <tr class="border-b border-white/8 text-[11px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
            <th class="px-4 py-3 font-semibold">{{ t('Name') }}</th>
            <th class="px-4 py-3 font-semibold">{{ t('Courses') }}</th>
            <th class="px-4 py-3 text-right font-semibold">{{ t('Actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/6 light:divide-slate-200">
          <tr v-for="item in tableItems" :key="item.id">
            <td class="px-4 py-3">
              <span class="text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ item.name }}</span>
            </td>
            <td class="px-4 py-3 text-white/70 light:text-slate-600">{{ item.courseCount }}</td>
            <td class="px-4 py-2 text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-0.5">
                <button
                  type="button"
                  :class="iconButton"
                  :aria-label="`Rename ${item.name}`"
                  :title="t('Rename')"
                  @click="renaming = item"
                >
                  <Pencil :size="15" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  :class="[iconButton, item.courseCount > 0 ? 'opacity-40' : 'hover:text-rose-300 light:hover:text-negative']"
                  :aria-label="`Delete ${item.name}`"
                  :aria-disabled="item.courseCount > 0 || undefined"
                  :title="item.courseCount > 0 ? t('Move its courses to another category first') : t('Delete')"
                  @click="askDelete(item)"
                >
                  <Trash2 :size="15" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <template #footer>
        <TablePagination v-model:page="tablePage" v-model:page-size="tablePageSize" :total="tableTotal" />
      </template>
    </DataTableFrame>

    <PromptModal
      :is-open="renaming !== null"
      :title="t('Rename category')"
      :description="renaming?.courseCount ? `${renaming.courseCount} ${renaming.courseCount === 1 ? 'course uses' : 'courses use'} this category and will show the new name.` : undefined"
      :label="t('Category name')"
      input-type="text"
      :initial-value="renaming?.name ?? ''"
      :maxlength="100"
      required
      require-change
      :confirm-label="t('Save')"
      :loading="busy"
      @close="renaming = null"
      @confirm="rename"
    />

    <ConfirmDeleteModal
      :is-open="pendingDelete !== null"
      :title="t('Delete Category')"
      :description="t('This category will no longer be available for courses.')"
      :item-name="pendingDelete?.name"
      :loading="busy"
      @close="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import DataTableFrame from '~/components/shared/DataTableFrame.vue'
import TablePagination from '~/components/shared/TablePagination.vue'
import { useClientPagination } from '~/composables/useClientPagination'
import type { Category } from '~/types'
import { Pencil, Trash2 } from 'lucide-vue-next'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import PromptModal from '~/components/shared/PromptModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import { useInstructor } from '~/composables/useInstructor'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()

definePageMeta({ requiresAdmin: true })
useHead({ title: t('Categories') })

const toast = useAppToast()
const { fetchCategories, createCategory, renameCategory, deleteCategory } = useInstructor()

const { data, pending, error, refresh } = await useAsyncData('admin-categories', fetchCategories, { server: false })
const categories = computed(() => data.value ?? [])
const { page: tablePage, pageSize: tablePageSize, total: tableTotal, items: tableItems, scrollKey: tableScrollKey } = useClientPagination(categories)

const newName = ref('')
const renaming = ref<Category | null>(null)
const pendingDelete = ref<Category | null>(null)
const busy = ref(false)

const iconButton = 'flex size-8 cursor-pointer items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-900'

// A category in use can't be deleted; say why instead of silently ignoring the click
function askDelete(item: Category) {
  if (item.courseCount > 0) {
    toast.info(t('Category in use'), `Move its ${item.courseCount} ${item.courseCount === 1 ? 'course' : 'courses'} to another category before deleting it.`)
    return
  }
  pendingDelete.value = item
}

async function act(action: () => Promise<unknown>, failure: string) {
  busy.value = true
  try {
    await action()
    await refresh()
  } catch (err) {
    toast.error(failure, getErrorMessage(err, t('Please try again.')))
  } finally {
    busy.value = false
  }
}

function add() {
  return act(async () => {
    await createCategory(newName.value.trim())
    newName.value = ''
  }, t('Category Not Added'))
}

function rename(name: string) {
  const item = renaming.value
  if (!item || !name) return
  return act(async () => {
    await renameCategory(item.id, name)
    renaming.value = null
    toast.success(t('Category renamed'), `"${item.name}" is now "${name}".`)
  }, t('Category Not Renamed'))
}

function confirmDelete() {
  const item = pendingDelete.value
  if (!item) return
  return act(async () => {
    await deleteCategory(item.id)
    pendingDelete.value = null
  }, t('Category Not Deleted'))
}
</script>
