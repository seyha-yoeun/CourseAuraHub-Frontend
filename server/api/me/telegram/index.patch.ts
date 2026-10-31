import type { TelegramStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const { enabled } = await readBody<{ enabled: boolean }>(event)

  return await backendRequest<TelegramStatus>(event, '/me/telegram', {
    method: 'PATCH',
    body: { enabled },
    csrf: true,
    fallbackMessage: 'Unable to update Telegram notifications',
  })
})
