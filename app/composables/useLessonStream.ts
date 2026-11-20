import type Hls from 'hls.js'
import type { Ref } from 'vue'
import type { LessonMedia } from '~/types/video'
import { useVideo } from '~/composables/useVideo'

type StreamMode = 'file' | 'native' | 'hls'

/**
 * Plays a video lesson's adaptive HLS stream in an existing <video> once the backend has transcoded it, and
 * lists its caption tracks. Bind the element's src to `src(fallback)`: until the stream is ready, or when it
 * fails, that is the lesson's own file. hls.js covers browsers without native HLS (everything but Safari).
 */
export function useLessonStream(video: Ref<HTMLVideoElement | null>, lessonId: () => number | null) {
  const { fetchMedia, playlistPath, captionPath } = useVideo()

  const media = ref<LessonMedia | null>(null)
  const mode = ref<StreamMode>('file')
  let hls: Hls | null = null

  const captions = computed(() => {
    const current = media.value
    if (!current) return []
    return current.captions.map(caption => ({ ...caption, src: captionPath(current.lessonId, caption.language) }))
  })

  /** The element's src: the playlist for native HLS, nothing while hls.js owns the element, else the file. */
  function src(fallback: string | null | undefined) {
    const id = media.value?.lessonId
    if (mode.value === 'native' && id) return playlistPath(id)
    if (mode.value === 'hls') return undefined
    return fallback || undefined
  }

  function detach() {
    hls?.destroy()
    hls = null
    mode.value = 'file'
  }

  async function attach(element: HTMLVideoElement, id: number) {
    if (element.canPlayType('application/vnd.apple.mpegurl')) {
      mode.value = 'native'
      return
    }
    const { default: HlsPlayer } = await import('hls.js')
    if (!HlsPlayer.isSupported() || lessonId() !== id) return
    // Let Vue drop the file's src before hls.js points the element at its own media source
    mode.value = 'hls'
    await nextTick()
    const player = new HlsPlayer()
    player.on(HlsPlayer.Events.ERROR, (_event, data) => {
      // A broken stream falls back to the original upload instead of a dead player
      if (data.fatal) detach()
    })
    player.loadSource(playlistPath(id))
    player.attachMedia(element)
    hls = player
  }

  watch([video, lessonId], async ([element, id], _old, onCleanup) => {
    detach()
    media.value = null
    if (!id) return
    let stale = false
    onCleanup(() => {
      stale = true
    })
    // Locked lessons, embeds and lessons without an upload simply have no stream
    const result = await fetchMedia(id).catch(() => null)
    if (stale) return
    media.value = result
    if (element && result?.status === 'ready' && result.streamUrl) {
      await attach(element, id)
    }
  }, { immediate: true })

  onBeforeUnmount(detach)

  return { media, captions, src, streaming: computed(() => mode.value !== 'file') }
}
