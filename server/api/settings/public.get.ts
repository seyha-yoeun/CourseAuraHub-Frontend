export default defineEventHandler(async (event) => {
  return await backendRequest<{ defaultLanguage: string }>(event, '/settings/public', {
    auth: false,
    fallbackMessage: 'Unable to load platform settings',
  })
})
