import type { MaybeRefOrGetter } from 'vue'

let lockCount = 0
let originalBodyOverflow = ''
let originalBodyPaddingRight = ''
let originalHtmlOverflow = ''

function applyScrollLock() {
  if (!import.meta.client || lockCount > 0) return

  const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
  const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0

  originalBodyOverflow = document.body.style.overflow
  originalBodyPaddingRight = document.body.style.paddingRight
  originalHtmlOverflow = document.documentElement.style.overflow

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
  }

  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  document.body.dataset.modalOpen = 'true'
}

function releaseScrollLock() {
  if (!import.meta.client || lockCount > 0) return

  document.body.style.overflow = originalBodyOverflow
  document.body.style.paddingRight = originalBodyPaddingRight
  document.documentElement.style.overflow = originalHtmlOverflow
  delete document.body.dataset.modalOpen

  originalBodyOverflow = ''
  originalBodyPaddingRight = ''
  originalHtmlOverflow = ''
}

/**
 * Locks background scrolling while one or more overlays are open.
 * A shared counter keeps nested/overlapping modals safe.
 */
export function useBodyScrollLock(isOpen: MaybeRefOrGetter<boolean>) {
  const isLocked = ref(false)

  function sync(open: boolean) {
    if (!import.meta.client) return

    if (open && !isLocked.value) {
      applyScrollLock()
      lockCount += 1
      isLocked.value = true
      return
    }

    if (!open && isLocked.value) {
      lockCount = Math.max(0, lockCount - 1)
      releaseScrollLock()
      isLocked.value = false
    }
  }

  watch(() => toValue(isOpen), sync, { immediate: true })

  onBeforeUnmount(() => sync(false))

  return isLocked
}
