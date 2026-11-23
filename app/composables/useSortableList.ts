import type { CSSProperties, Ref } from 'vue'

/*
 * Drag-and-drop reordering for vertical lists, with no library.
 * - Pointer events, so mouse, touch and pen all work. Drag from a handle (`data-sortable-handle`,
 *   give it `touch-none`); rows carry `data-sortable-item`.
 * - Other rows slide out of the way while dragging; Escape cancels (before an enclosing dialog sees it).
 * - Keyboard: with a handle focused, ArrowUp / ArrowDown move the row one place and focus follows it.
 * - Every move is described in `announcement`; render it in an aria-live region.
 *
 * useDragReorder handles several lists at once (e.g. the lessons of each curriculum section), identified
 * by a key; useSortableList wraps it for a single list held in a ref.
 */

interface DragReorderOptions {
  /** Persist a move: `key` identifies the list, `from`/`to` are indexes in it. */
  onReorder: (key: string, from: number, to: number) => void
  /** Name of the item read out for screen readers */
  label: (key: string, index: number) => string
}

export function useDragReorder(options: DragReorderOptions) {
  const dragKey = ref<string | null>(null)
  const dragIndex = ref<number | null>(null)
  const overIndex = ref<number | null>(null)
  const dragOffset = ref(0)
  const announcement = ref('')

  let startY = 0
  let rects: DOMRect[] = []
  let gap = 0

  function rowsOf(element: HTMLElement | null) {
    return Array.from(element?.querySelectorAll<HTMLElement>(':scope > [data-sortable-item]') ?? [])
  }

  function reset() {
    dragKey.value = null
    dragIndex.value = null
    overIndex.value = null
    dragOffset.value = 0
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', reset)
    window.removeEventListener('keydown', onEscape, true)
  }

  /** Start dragging row `index` of list `key`. `list` is the element holding that list's rows. */
  function onPointerDown(event: PointerEvent, key: string, index: number, list: HTMLElement | null) {
    if (event.button !== 0 || !list) return
    const rows = rowsOf(list)
    if (rows.length < 2) return
    event.preventDefault()
    rects = rows.map(row => row.getBoundingClientRect())
    gap = Math.max(0, rects[1]!.top - rects[0]!.bottom)
    startY = event.clientY
    dragKey.value = key
    dragIndex.value = index
    overIndex.value = index
    dragOffset.value = 0
    announcement.value = `Picked up ${options.label(key, index)}.`
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', reset)
    // Capture phase: Escape cancels the drag before an enclosing dialog sees it and closes
    window.addEventListener('keydown', onEscape, true)
  }

  function onPointerMove(event: PointerEvent) {
    const from = dragIndex.value
    if (from === null) return
    const self = rects[from]!
    // Keep the row inside its list
    const min = rects[0]!.top - self.top
    const max = rects[rects.length - 1]!.bottom - self.bottom
    dragOffset.value = Math.min(max, Math.max(min, event.clientY - startY))
    // The row lands after every other row whose middle it has passed
    const center = self.top + self.height / 2 + dragOffset.value
    overIndex.value = rects.filter((rect, i) => i !== from && rect.top + rect.height / 2 < center).length
  }

  function onPointerUp() {
    const key = dragKey.value
    const from = dragIndex.value
    const to = overIndex.value
    reset()
    if (key !== null && from !== null && to !== null && from !== to) commit(key, from, to, rects.length)
  }

  function onEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    announcement.value = 'Move cancelled.'
    reset()
  }

  function commit(key: string, from: number, to: number, count: number) {
    const label = options.label(key, from)
    options.onReorder(key, from, to)
    announcement.value = `${label} moved to position ${to + 1} of ${count}.`
  }

  /** ArrowUp / ArrowDown on a focused handle. `count` is the list length. */
  function onHandleKeydown(event: KeyboardEvent, key: string, index: number, count: number) {
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (!delta) return
    event.preventDefault()
    const to = index + delta
    if (to < 0 || to >= count) return
    const list = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-sortable-item]')?.parentElement ?? null
    commit(key, index, to, count)
    // Focus follows the row to its new place once the list re-renders
    nextTick(() => rowsOf(list)[to]?.querySelector<HTMLElement>('[data-sortable-handle]')?.focus())
  }

  /** Transform for a row while dragging: the dragged row follows the pointer, the others make room. */
  function itemStyle(key: string, index: number): CSSProperties {
    const from = dragIndex.value
    const to = overIndex.value
    if (dragKey.value !== key || from === null || to === null) return {}
    if (index === from) {
      return { transform: `translateY(${dragOffset.value}px)`, zIndex: 10, position: 'relative' }
    }
    const shift = rects[from]!.height + gap
    let offset = 0
    if (from < to && index > from && index <= to) offset = -shift
    if (from > to && index >= to && index < from) offset = shift
    return { transform: `translateY(${offset}px)`, transition: 'transform 150ms ease' }
  }

  function isDragging(key: string, index?: number) {
    return dragKey.value === key && (index === undefined || dragIndex.value === index)
  }

  onBeforeUnmount(reset)

  return { announcement, isDragging, itemStyle, onPointerDown, onHandleKeydown }
}

/** Reorder an array: returns a new array with the item at `from` moved to `to`. */
export function moveItem<T>(list: T[], from: number, to: number) {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  if (moved !== undefined) next.splice(to, 0, moved)
  return next
}

/** A single sortable list held in a ref. */
export function useSortableList<T>(items: Ref<T[]>, options: { container: Ref<HTMLElement | null>, label: (item: T) => string }) {
  const KEY = 'list'
  const core = useDragReorder({
    onReorder: (_key, from, to) => {
      items.value = moveItem(items.value, from, to)
    },
    label: (_key, index) => options.label(items.value[index]!),
  })

  return {
    announcement: core.announcement,
    isDragging: (index?: number) => core.isDragging(KEY, index),
    itemStyle: (index: number) => core.itemStyle(KEY, index),
    onPointerDown: (event: PointerEvent, index: number) => core.onPointerDown(event, KEY, index, options.container.value),
    onHandleKeydown: (event: KeyboardEvent, index: number) => core.onHandleKeydown(event, KEY, index, items.value.length),
    /** Move by index (for the up/down buttons); announced like a drag. */
    move: (from: number, to: number) => {
      if (to < 0 || to >= items.value.length || from === to) return
      const label = options.label(items.value[from]!)
      items.value = moveItem(items.value, from, to)
      core.announcement.value = `${label} moved to position ${to + 1} of ${items.value.length}.`
    },
  }
}
