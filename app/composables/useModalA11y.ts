import type { MaybeRefOrGetter, Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

interface ModalA11yOptions {
  isOpen: MaybeRefOrGetter<boolean>
  dialogRef: Ref<HTMLElement | null>
  onClose: () => void
  closeOnEscape?: boolean
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => {
      if (element.getAttribute('aria-hidden') === 'true') return false
      return element.getClientRects().length > 0
    })
}

/**
 * Shared modal behavior: background scroll lock, focus management, focus trap,
 * and Escape-to-close. Every modal should use this so interaction is consistent.
 */
export function useModalA11y(options: ModalA11yOptions) {
  const { isOpen, dialogRef, onClose, closeOnEscape = true } = options
  const open = () => toValue(isOpen)

  useBodyScrollLock(isOpen)

  let previouslyFocused: HTMLElement | null = null

  watch(
    () => toValue(isOpen),
    async (isOpenNow) => {
      if (!import.meta.client) return

      if (isOpenNow) {
        previouslyFocused = document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

        await nextTick()
        dialogRef.value?.focus({ preventScroll: true })
        return
      }

      const target = previouslyFocused
      previouslyFocused = null

      await nextTick()
      target?.focus({ preventScroll: true })
    },
    { immediate: true, flush: 'post' }
  )

  function handleKeydown(event: KeyboardEvent) {
    if (!open()) return

    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const dialog = dialogRef.value
    if (!dialog) return

    const focusableElements = getFocusableElements(dialog)

    if (focusableElements.length === 0) {
      event.preventDefault()
      dialog.focus({ preventScroll: true })
      return
    }

    const firstElement = focusableElements[0]!
    const lastElement = focusableElements[focusableElements.length - 1]!
    const activeElement = document.activeElement

    if (event.shiftKey) {
      if (activeElement === firstElement || activeElement === dialog || !dialog.contains(activeElement)) {
        event.preventDefault()
        lastElement.focus({ preventScroll: true })
      }
      return
    }

    if (activeElement === lastElement || !dialog.contains(activeElement)) {
      event.preventDefault()
      firstElement.focus({ preventScroll: true })
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
    previouslyFocused = null
  })
}
