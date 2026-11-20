// Service worker for browser notifications. It only shows the backend's Web Push messages
// ({ id, type, title, body, url }) and opens their link inside the app when clicked.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }

  event.waitUntil(self.registration.showNotification(data.title || 'CourseAuraHub', {
    body: data.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    // A repeated notification replaces the earlier one instead of stacking
    tag: data.id ? `notification-${data.id}` : undefined,
    data: { url: data.url || '/' },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/', self.location.origin)
  // Links come from the backend, but only pages of this app are ever opened
  if (target.origin !== self.location.origin) return

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const open = windows.find(client => new URL(client.url).origin === target.origin)
    if (open) {
      await open.focus()
      try {
        await open.navigate(target.href)
        return
      } catch {
        // A tab this worker doesn't control can't be navigated; open a new one instead
      }
    }
    await self.clients.openWindow(target.href)
  })())
})
