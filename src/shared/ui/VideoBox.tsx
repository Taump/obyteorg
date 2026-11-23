import { VideoFacade } from './VideoFacade'

export type Video = {
  provider?: 'youtube' | 'vimeo' | null
  videoId?: string | null
  title?: string | null
}

export const hasVideo = (
  v: Video | null | undefined,
): v is Video & { provider: 'youtube' | 'vimeo'; videoId: string } => !!(v?.provider && v.videoId)

/** A video facade in its wrapper element (`.iframe-block`, `.video-block` …), if set. */
export function VideoBox({
  video,
  className,
}: {
  video: Video | null | undefined
  className: string
}) {
  if (!hasVideo(video)) return null
  return (
    <div className={className}>
      <VideoFacade provider={video.provider} videoId={video.videoId} title={video.title} />
    </div>
  )
}
