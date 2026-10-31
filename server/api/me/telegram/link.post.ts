import type { TelegramConnectLink } from '~/types'

export default defineEventHandler(async (event) => {
  return await backendRequest<TelegramConnectLink>(event, '/me/telegram/link', {
    method: 'POST',
    csrf: true,
    fallbackMessage: 'Unable to create a Telegram link',
  })
})
