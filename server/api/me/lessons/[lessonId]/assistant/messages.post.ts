export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')
  const body = await readBody<{ conversationId?: unknown, message?: unknown }>(event).catch(() => undefined)

  // Streams the answer: conversation, delta (pieces of text), then done or error
  return await proxyBackendPostStream(event, `/me/lessons/${lessonId}/assistant/messages`, {
    conversationId: body?.conversationId ?? null,
    message: body?.message,
  }, 'The study assistant couldn\'t answer. Please try again.')
})
