export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')

  return await proxyBackendFile(event, `/me/lessons/${lessonId}/stream.m3u8`, 'Unable to load the video stream')
})
