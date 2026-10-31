import type { TelegramConnectLink, TelegramStatus } from '~/types'

export function useTelegram() {
  async function fetchStatus() {
    return await $fetch<TelegramStatus>('/api/me/telegram')
  }

  async function createConnectLink() {
    return await $fetch<TelegramConnectLink>('/api/me/telegram/link', { method: 'POST' })
  }

  async function setEnabled(enabled: boolean) {
    return await $fetch<TelegramStatus>('/api/me/telegram', { method: 'PATCH', body: { enabled } })
  }

  async function disconnect() {
    return await $fetch('/api/me/telegram', { method: 'DELETE' })
  }

  return { fetchStatus, createConnectLink, setEnabled, disconnect }
}
