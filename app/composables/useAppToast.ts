type ToastKind = 'success' | 'error' | 'info' | 'warning'

export interface AppToastOptions {
  /** One follow-up action, e.g. { label: 'Undo', onClick } or { label: 'View', onClick }. */
  action?: { label: string, onClick: () => void }
  /** Override the default time on screen (ms). */
  duration?: number
}

/**
 * Per-kind behaviour. Errors stay longer (people need time to read what went wrong) and are
 * announced assertively; everything else is polite. Visual style lives in app.config.ts (ui.toast).
 */
const KIND: Record<ToastKind, { color: 'success' | 'error' | 'info' | 'warning', icon: string, duration: number, type: 'foreground' | 'background' }> = {
  success: { color: 'success', icon: 'i-lucide-circle-check', duration: 4000, type: 'background' },
  info: { color: 'info', icon: 'i-lucide-info', duration: 4500, type: 'background' },
  warning: { color: 'warning', icon: 'i-lucide-triangle-alert', duration: 6000, type: 'foreground' },
  error: { color: 'error', icon: 'i-lucide-circle-alert', duration: 7000, type: 'foreground' },
}

export function useAppToast() {
  const nuxtToast = useToast()

  function show(kind: ToastKind, title: string, description?: string, options: AppToastOptions = {}) {
    const config = KIND[kind]
    try {
      return nuxtToast.add({
        // Same message twice (double-click, repeated failure) pulses the existing toast instead of stacking.
        id: `${kind}:${title}:${description ?? ''}`,
        title,
        description,
        color: config.color,
        icon: config.icon,
        duration: options.duration ?? config.duration,
        type: config.type,
        progress: false,
        actions: options.action
          ? [{ label: options.action.label, color: 'neutral', variant: 'outline', onClick: options.action.onClick }]
          : undefined,
      })
    } catch (e) {
      // useToast needs the Nuxt app; outside it (e.g. during teardown) just log.
      console[kind === 'error' ? 'error' : 'log'](`[Toast ${kind}] ${title}: ${description ?? ''}`, e)
    }
  }

  const success = (title: string, description?: string, options?: AppToastOptions) => show('success', title, description, options)
  const error = (title: string, description?: string, options?: AppToastOptions) => show('error', title, description, options)
  const info = (title: string, description?: string, options?: AppToastOptions) => show('info', title, description, options)
  const warning = (title: string, description?: string, options?: AppToastOptions) => show('warning', title, description, options)

  /** Confirmation after a create/update/delete/status change. Always a success: the action worked. */
  function crud(action: 'create' | 'update' | 'delete' | 'status', entity: string, name?: string) {
    const titles = {
      create: `${entity} created`,
      update: `${entity} updated`,
      delete: `${entity} deleted`,
      status: `${entity} status updated`,
    }
    const descriptions = {
      create: name ? `"${name}" was added.` : undefined,
      update: name ? `Changes to "${name}" were saved.` : undefined,
      delete: name ? `"${name}" was removed.` : undefined,
      status: name ? `"${name}" has a new status.` : undefined,
    }
    return show('success', titles[action], descriptions[action])
  }

  return {
    toast: nuxtToast,
    success,
    error,
    info,
    warning,
    crud,
  }
}
