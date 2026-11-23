<template>
  <!-- Pagination bar for listings: range summary, rows-per-page, and page navigation. Page is 0-based. -->
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 text-[13px] text-white/55 light:text-slate-500">
    <p class="tabular-nums" aria-live="polite">
      <template v-if="total > 0">
        {{ t('Showing') }} <span class="font-medium text-slate-100 light:text-slate-800">{{ rangeStart }}–{{ rangeEnd }}</span>
        {{ t('of') }} <span class="font-medium text-slate-100 light:text-slate-800">{{ total.toLocaleString() }}</span>
      </template>
      <template v-else>{{ t('No results') }}</template>
    </p>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex items-center gap-2">
        <span :id="sizeLabelId" class="whitespace-nowrap">{{ t('Rows per page') }}</span>
        <div class="w-[4.75rem]">
          <AppDropdown
            :model-value="pageSize"
            :options="sizeOptions"
            size="xs"
            :disabled="disabled"
            :aria-label="t('Rows per page')"
            @update:model-value="changeSize(Number($event))"
          />
        </div>
      </div>

      <nav class="flex items-center gap-1" :aria-label="t('Pagination')">
        <button
          type="button"
          :class="navButton"
          :disabled="disabled || page <= 0"
          :aria-label="t('Previous page')"
          @click="go(page - 1)"
        >
          <ChevronLeft :size="16" aria-hidden="true" />
        </button>

        <!-- Numbered pages on wider screens; "2 / 14" on phones -->
        <span class="px-1.5 tabular-nums sm:hidden">{{ page + 1 }} / {{ Math.max(totalPages, 1) }}</span>
        <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
          <span v-if="item === 'gap'" class="hidden w-6 text-center sm:inline" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            class="hidden h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-[13px] font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-not-allowed sm:inline-flex"
            :class="item === page
              ? 'bg-brand-500 text-white'
              : 'text-white/65 hover:bg-white/6 hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900'"
            :aria-current="item === page ? 'page' : undefined"
            :aria-label="`${t('Page')} ${item + 1}`"
            :disabled="disabled"
            @click="go(item)"
          >
            {{ item + 1 }}
          </button>
        </template>

        <button
          type="button"
          :class="navButton"
          :disabled="disabled || page + 1 >= totalPages"
          :aria-label="t('Next page')"
          @click="go(page + 1)"
        >
          <ChevronRight :size="16" aria-hidden="true" />
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import AppDropdown from '~/components/shared/AppDropdown.vue'

const props = withDefaults(defineProps<{
  /** 0-based current page */
  page: number
  pageSize: number
  /** Total number of items across all pages */
  total: number
  pageSizes?: number[]
  disabled?: boolean
}>(), {
  pageSizes: () => [10, 25, 50, 100],
  disabled: false,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [size: number]
}>()

const { t } = useT()

const sizeLabelId = `rows-label-${useId()}`
const sizeOptions = computed(() => props.pageSizes.map(size => ({ value: size, label: String(size) })))

const navButton = 'inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-white/65 transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900'

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const rangeStart = computed(() => (props.total === 0 ? 0 : props.page * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(props.total, (props.page + 1) * props.pageSize))

// First, last, and the current page with one neighbour each side; gaps become "…".
const pageItems = computed<(number | 'gap')[]>(() => {
  const last = totalPages.value - 1
  const current = props.page
  if (last <= 6) return Array.from({ length: last + 1 }, (_, i) => i)
  const pages = new Set([0, last, current - 1, current, current + 1].filter(p => p >= 0 && p <= last))
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) result.push('gap')
    result.push(p)
  })
  return result
})

function go(target: number) {
  const next = Math.min(Math.max(target, 0), totalPages.value - 1)
  if (next !== props.page) emit('update:page', next)
}

function changeSize(size: number) {
  // Keep the first visible row on screen when the page size changes.
  const firstRow = props.page * props.pageSize
  emit('update:pageSize', size)
  emit('update:page', Math.floor(firstRow / size))
}
</script>
