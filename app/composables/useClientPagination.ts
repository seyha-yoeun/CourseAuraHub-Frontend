import type { ComputedRef, Ref, WatchSource } from 'vue'

export const DEFAULT_PAGE_SIZE = 10

interface ClientPaginationOptions {
  pageSize?: number
  /** Search/filter state: when any of it changes, go back to the first page. */
  resetOn?: WatchSource[]
}

/**
 * Paginates a list that is already fully loaded (search and filters run in the browser).
 * Pair with <TablePagination> and <DataTableFrame>. Server-paged listings keep their own page/size
 * refs and pass them to the API instead.
 *
 * Data refreshes (e.g. after deleting a row) keep the current page; it is only clamped if the
 * list got shorter. Changing a filter in `resetOn` returns to the first page.
 */
export function useClientPagination<T>(source: Ref<T[]> | ComputedRef<T[]>, options: ClientPaginationOptions = {}) {
  const page = ref(0)
  const pageSize = ref(options.pageSize ?? DEFAULT_PAGE_SIZE)

  const total = computed(() => source.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const items = computed(() => source.value.slice(page.value * pageSize.value, (page.value + 1) * pageSize.value))

  if (options.resetOn?.length) {
    watch(options.resetOn, () => {
      page.value = 0
    })
  }

  watch(totalPages, (count) => {
    if (page.value > count - 1) page.value = count - 1
  })

  /** Changes with page and size, for DataTableFrame's scroll-to-top. */
  const scrollKey = computed(() => `${page.value}:${pageSize.value}`)

  return { page, pageSize, total, totalPages, items, scrollKey }
}
