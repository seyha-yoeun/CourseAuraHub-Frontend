interface LessonMedia {
  captions: { language: string, url: string }[]
}

/**
 * A lesson's WebVTT captions served from this origin, so the player's <track> works without the storage
 * bucket allowing cross-origin reads. The signed link comes from the backend's media endpoint, never the browser.
 */
export default defineEventHandler(async (event) => {
  const lessonId = encodeURIComponent(getRouterParam(event, 'lessonId') ?? '')
  const lang = getRouterParam(event, 'lang') ?? ''

  const media = await backendRequest<LessonMedia>(event, `/me/lessons/${lessonId}/media`, {
    fallbackMessage: 'Unable to load the captions',
  })
  const caption = media?.captions?.find(item => item.language === lang)
  if (!caption) {
    throw createError({ statusCode: 404, statusMessage: 'No captions in this language' })
  }

  const upstream = await fetch(caption.url)
  if (!upstream.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Unable to load the captions' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/vtt; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return await upstream.text()
})
