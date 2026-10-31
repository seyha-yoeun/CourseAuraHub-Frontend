import type { TelegramStatus } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<TelegramStatus>(event, '/me/telegram', {
    fallbackMessage: 'Unable to load your Telegram connection',
  })
})
