import type { PushPreference, PushSubscriptionStatus, VapidKey } from '~/types/push'

const WORKER_PATH = '/push-sw.js'

function toKeyBytes(base64Url: string) {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

/** Browser (Web Push) notifications: subscribe this browser, unsubscribe it, and choose which types are pushed. */
export function useWebPush() {
  const supported = import.meta.client
    && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

  async function fetchVapidKey() {
    return await $fetch<VapidKey>('/api/push/vapid-public-key')
  }

  async function fetchPreferences() {
    return await $fetch<PushPreference[]>('/api/me/push-preferences')
  }

  async function savePreferences(preferences: PushPreference[]) {
    return await $fetch<PushPreference[]>('/api/me/push-preferences', { method: 'PUT', body: { preferences } })
  }

  /** This browser's subscription, if it already has one from our worker. */
  async function currentSubscription() {
    if (!supported) return null
    const registration = await navigator.serviceWorker.getRegistration(WORKER_PATH)
    return (await registration?.pushManager.getSubscription()) ?? null
  }

  /** Asks for permission, subscribes with the server's VAPID key and registers the subscription. */
  async function subscribe(publicKey: string) {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error(permission === 'denied'
        ? 'Notifications are blocked for this site. Allow them in your browser settings, then try again.'
        : 'Notifications weren\'t allowed.')
    }
    const registration = await navigator.serviceWorker.register(WORKER_PATH)
    await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
      ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKeyBytes(publicKey) })
    return await $fetch<PushSubscriptionStatus>('/api/me/push-subscriptions', { method: 'POST', body: subscription.toJSON() })
  }

  async function unsubscribe() {
    const subscription = await currentSubscription()
    if (!subscription) return null
    const status = await $fetch<PushSubscriptionStatus>('/api/me/push-subscriptions', {
      method: 'DELETE',
      body: { endpoint: subscription.endpoint },
    })
    await subscription.unsubscribe()
    return status
  }

  return { supported, fetchVapidKey, fetchPreferences, savePreferences, currentSubscription, subscribe, unsubscribe }
}
