export function useAppToast() {
  const nuxtToast = useToast()

  function success(title: string, description?: string) {
    try {
      return nuxtToast.add({
        title,
        description,
        color: 'success',
        icon: 'i-lucide-check-circle-2',
      })
    } catch (e) {
      console.log(`[Toast Success] ${title}: ${description}`, e)
    }
  }

  function error(title: string, description?: string) {
    try {
      return nuxtToast.add({
        title,
        description,
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    } catch (e) {
      console.error(`[Toast Error] ${title}: ${description}`, e)
    }
  }

  function info(title: string, description?: string) {
    try {
      return nuxtToast.add({
        title,
        description,
        color: 'primary',
        icon: 'i-lucide-info',
      })
    } catch (e) {
      console.log(`[Toast Info] ${title}: ${description}`, e)
    }
  }

  function warning(title: string, description?: string) {
    try {
      return nuxtToast.add({
        title,
        description,
        color: 'warning',
        icon: 'i-lucide-alert-triangle',
      })
    } catch (e) {
      console.warn(`[Toast Warning] ${title}: ${description}`, e)
    }
  }

  /**
   * Dedicated helper for CRUD action toasts with predefined messages and styles
   */
  function crud(action: 'create' | 'update' | 'delete' | 'status', entity: string, name?: string) {
    const titleMap = {
      create: `${entity} Created Successfully`,
      update: `${entity} Updated`,
      delete: `${entity} Deleted`,
      status: `${entity} Status Changed`
    }
    const descMap = {
      create: name ? `"${name}" has been added to the catalog.` : `New ${entity.toLowerCase()} record created.`,
      update: name ? `Changes to "${name}" saved successfully.` : `${entity} record updated.`,
      delete: name ? `"${name}" was permanently removed.` : `${entity} record deleted.`,
      status: name ? `Status state updated for "${name}".` : `Status state modified.`
    }
    const colorMap: Record<string, 'success' | 'primary' | 'error' | 'warning'> = {
      create: 'success',
      update: 'primary',
      delete: 'error',
      status: 'warning'
    }
    const iconMap = {
      create: 'i-lucide-check-circle-2',
      update: 'i-lucide-edit-3',
      delete: 'i-lucide-trash-2',
      status: 'i-lucide-refresh-cw'
    }

    try {
      return nuxtToast.add({
        title: titleMap[action],
        description: descMap[action],
        color: colorMap[action],
        icon: iconMap[action],
      })
    } catch (e) {
      console.log(`[CRUD Toast] ${action} ${entity}: ${name}`, e)
    }
  }

  return {
    toast: nuxtToast,
    success,
    error,
    info,
    warning,
    crud
  }
}
